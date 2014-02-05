#!/bin/bash

set -o errexit

## Author: Bricklen
## Trufflehunter project home: https://github.com/bricklen/trufflehunter
##
## PgBadger Copyright (c) 2012-2014, Dalibo, http://dalibo.github.io/pgbadger/
##
## Prerequisites
##  1. The pgbadger executable must be in the path of whichever user is parsing the data
##      ln -s ~postgres/pgbadger/pgbadger /usr/sbin/pgbadger
##  2. Sendmail should be installed and running.
##
## TODO:
##      - Add handling in case the bash script exits (trap the exit).
##      - Add a scheduled process to remove old files. This should be an add-on script.
##
## cron job sample
##      * * * * * /bin/bash /path/to/exec_pgbadger.sh -p 80
##

PATH=$PATH:/usr/sbin
hostip=$(hostname -I)
hostip=`echo "$hostip" | tr -d ' '`

pgbadger=$(which pgbadger)
node=$(which node)
npm_prefix=$(npm prefix)

#curdir=/root/node_modules/formidable/example
curdir=`dirname "$(readlink -nf "$0")"`

## Set this to where the "uploads" directory is
SRCDIR=${curdir}/uploads

SEND_EMAIL=
llp=
email=
logfile=
matched=

function die
{
    local exit_status=$1
    shift
    echo "$@" >&2
    exit $exit_status
}

usage()
{
cat <<-EOF
        Usage: ${0##*/} options

        This script is a command-line interface to PgBadger, designed to run via cron.
        Project details can be found at https://github.com/bricklen/trufflehunter

        Sample usage:
                # Minimal usage:
                bash exec_pgbadger.sh -l /path/to/files-to-parse

                # Pass in path to log files, and path to the config file which contains log_line_prefix, email, etc.
                bash exec_pgbadger.sh -l /path/to/files-to-parse -c file.config

                # Do not send email, and has link to parsed file, and web server port
                bash exec_pgbadger.sh -l /path/to/files-to-parse -c file.config -n -p 80

        OPTIONS:
        -h      Show this message.
        -l      The path to the config files/log files. Mandatory.
        -c      Config file, contains the log file name, the log_line_prefix, and the destination email address. Optional.
        -n      Do not send email with results.
        -p      Port that the trufflehunter.js is listening on.

EOF
}

function send_email
{
    ## Send an email to the user after the log file has been processed.
    if [[ "X$node" != "X" ]]; then
        $node ${curdir}/send_email.js --recipient="$1" --url="$weburl/$2" --bytes=$3 --fname="$4"
    else
        echo "node.js not found, so email will not be sent!"
    fi
}

function do_work
{
    confname="$1"
    send_email="$2"
    
    cp "$confname" "$confname.processing" && rm "$confname" || die 133 "ERROR: Could not process file \"$confname\"";
    unset matched llp email logfile
    top_num_queries=50

    ## Process each row in the config file
    while IFS='=' read key value; do
        value=`sed -e 's/^"//' -e 's/"$//' <<< $value`

        ## log_line_prefix, email, logfile
        if [[ "$key" == "log_line_prefix" ]]; then
            llp="$value";
            matched=1;
        elif [[ "$key" == "email" ]]; then
            email="$value";
            matched=1;
        elif [[ "$key" == "logfile" ]]; then
            logfile="$value";
            matched=1;
        elif [[ "$key" == "top_num_queries" ]]; then
            top_num_queries="$value";
            matched=1;
        fi
    done < "$confname.processing"

    if [[ "$matched" != "1" ]]; then
        echo "No matching keys. Cleaning up."
        mv "$confname.processing" "$confname"
        exit 1
    fi

    if [[ "X$logfile" == "X" ]]; then
        echo "No log file name found in config file. Cleaning up."
        mv "$confname.processing" "$confname"
        exit 1
    fi

    ## Info for the email, collected before the file is extracted
    flastmod=`stat -c%y "$SRCDIR/$logfile"`

    ## Determine file type and uncompress if necessary
    mimetype=`file --brief --mime-type --no-pad --preserve-date "$logfile"`

    ## Strip the .gz/.zip/.bz2 file extension, to use as the target of the uncompress action
    fname_no_ext=${logfile%.*}

    if [[ "$mimetype" == "application/x-gzip" ]]; then
        gunzip -c "$logfile" > "$fname_no_ext"
        file_to_parse="$fname_no_ext"
    elif [[ "$mimetype" == "application/zip" ]]; then
        unzip -j -p "$logfile" > "$fname_no_ext"
        file_to_parse="$fname_no_ext"
    elif [[ "$mimetype" == "application/x-bzip2" ]]; then
        bunzip2 -c "$logfile" > "$fname_no_ext"
        file_to_parse="$fname_no_ext"
    else
        ## Could probably use more mime type handling before dropping into an ELSE handler
        file_to_parse="$logfile"
    fi

    fsize=`stat -c%s "$SRCDIR/$file_to_parse"`

    ## Untar the files if $fname_no_ext is a tar archive, and cat any files
    ## contained with to a single file
    unset mimetype
    mimetype=`file --brief --mime-type --no-pad --preserve-date "$fname_no_ext"`

    ## If it is a tar archive, extract a file at a time then remove the tar file at the end
    if [[ "$mimetype" == "application/x-tar" ]]; then
        for tarfile in `tar -tf "$fname_no_ext"`; do
            ## combine the files into one file, in the listed order
            tar --extract --file="$fname_no_ext" "$tarfile"
            cat "$tarfile" >> ${fname_no_ext}_all
        done

        ## TODO: Add more handling to remove the files that should no longer 
        ## exist in the event of an error. Eg unzipped, untarred, .processing, etc.
        mv "$fname_no_ext" "$fname_no_ext.done" || die 143 "ERROR: Error renaming \"$fname_no_ext\" to .done";
        file_to_parse=${fname_no_ext}_all
    fi

    ## Append the pid and epoch time to the file name.
    ## EDIT: Leave the original file name as the node script adds some random
    ## digits to the file name before this script is executed.
    ##output_htmlname="${file_to_parse}_$$_`date +'%s'`.html"
    output_htmlname="${fname_no_ext}.html"
    cmd="$pgbadger --prefix '$llp' --top $top_num_queries -j2 -o \"$SRCDIR/$output_htmlname\" \"$SRCDIR/$file_to_parse\""

    #echo "About to execute command: $cmd"
    echo "$cmd" | bash -l

    if [[ "$send_email" != "no" ]]; then
        ## Send the email with the link
        send_email "$email" "$output_htmlname" "$fsize" "$flastmod" || die 153 "ERROR: Something went wrong sending the email. \"$?\""
    fi

    ## Ensure that the config file does not get processed again
    mv "$confname.processing" "$confname.done" || die 143 "ERROR: Error renaming \"$confname.processing\" to .done";
    mv "$SRCDIR/$file_to_parse" "$SRCDIR/$file_to_parse.done" || die 143 "ERROR: Error renaming \"$file_to_parse\" to .done";

    ## Remove and .done files
    rm -f ${SRCDIR}/*.done
}

while getopts "l:cp:nh" OPTION
do
        case $OPTION in
        h)
                usage
                exit 0
                ;;
        l)
                SRCDIR=$OPTARG
                ;;
        c)
                CONFIGFILE=$OPTARG
                ;;
        n)
                SEND_EMAIL="no"
                ;;
        p)
                webport=$OPTARG
                ;;
        ?)
                usage
                exit 1
                ;;
        esac
done

## Try to determine the node port if not supplied
## This check is possibly completely bogus.
if [[ "X$webport" == "X" ]]; then
    webport=$(netstat -tlpn | grep -E '[0-9]+\/node' | awk '{print $4}' | sed 's/0\.0\.0\.0://g')
fi

[[ "X$hostip" != "X" ]] || die 120 "ERROR: host IP not defined."
[[ "X$webport" != "X" ]] || die 125 "ERROR: node.js server port is not defined."

## TODO: Add check to see if $webport is being actively listened on, if not, abort.

cd "$SRCDIR" || die 130 "ERROR: Could not change to $SRCDIR"

weburl=http://${hostip}:${webport}/uploads

if [[ "X$CONFIGFILE" == "X" ]];  then
    for confname in `find $SRCDIR -maxdepth 1 -name "*.config" -exec basename {} \;`; do
        ## Loop each .config file and do the processing
        do_work "$confname" "$SEND_EMAIL"
    done
else
    # A config file was specified, so use that
    echo "Using specific config file \"$CONFIGFILE\""
    do_work "$CONFIGFILE" "$SEND_EMAIL"
fi

exit 0
