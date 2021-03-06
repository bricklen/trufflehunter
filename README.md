trufflehunter
=============

A web front-end to the handy PgBadger PostgreSQL log parsing tool.
Node.js serves the pages, Formidable parses the form, PgBadger parses the PostgreSQL log files, nodemail.js sends the email, and it is all glued together with some Bash.


**Prerequisites**
- node.js - See https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
- npm - Depending on OS, it can be installed by package manager, or manually (https://npmjs.org/doc/README.html)

**Dependencies**
- bootstrap (no download, index.html calls CDN)
- jQuery (no download, scripts call CDN's)
- sendmail, to send notification of completed PgBadger execution.
- trufflehunter.js listens on port 8080 by default.


**Installation**

Note: these steps may not be complete. Some cleanup (and preferably packaging) is desired.

    ## Depending on which OS and how node and npm were installed,
    ## some permissions might need to be changed.
    sudo chmod a+rw -R /usr/share/npm
    sudo chmod a+x -R /usr/share/npm/node_modules/*
    
    npm config set registry http://registry.npmjs.org/
    export NODE_MODULES=$HOME/trufflehunter/node_modules
    npm --prefix $NODE_MODULES install -g node --save
    npm --prefix $NODE_MODULES install nodemon@latest --save
    npm --prefix $NODE_MODULES install formidable@latest --save
    npm --prefix $NODE_MODULES install nodemailer@latest --save
    npm --prefix $NODE_MODULES install optimist@latest --save
    npm --prefix $NODE_MODULES install semver@latest --save
    npm --prefix $NODE_MODULES install npm-registry-client@latest --save
    npm --prefix $NODE_MODULES install forever@latest --save
    
    # In Ubuntu 13.10, I had to create a symlink to node.js because the "node" app didn't exist.
    sudo ln -s /usr/bin/nodejs /usr/bin/node
    
    # Create a symlink to wherever PgBadger is installed
    # Assuming PgBadger is installed at $HOME/pgbadger:
    sudo ln -s $HOME/pgbadger/pgbadger /usr/bin/pgadger
    
A crontab entry must be created for the user who owns the Trufflehunter directory.
It is executed every minute and invokes the PgParser parser. The parsed file is then optionally emailed to the recipient.

    * * * * * /bin/bash $HOME/trufflehunter/scripts/exec_pgbadger.sh -p 8080

Install sendmail via your package manager (configuration is left up to the user).
For example:

    yum install sendmail
    -or-
    aptitude install sendmail

Change the "from_email" variable in /scripts/send_email.js to a legitimate email address. Invalid email addresses can cause the output email to be flagged as spam or a phishing attempt.


**Usage**

Determine the IP you are going to connect to, to serve the trufflehunter web page. Some methods (depending on your linux distro) include:

    hostname -I
    /sbin/ip a

If you are serving Trufflehunter internally only, then it makes sense to use the internal IP. If you are exposing it to users outside of your network, then you will need to use the external IP (and add firewall rules and lock down the trufflehunter directory!)

Start the node server to listen for connections:

    export TRUFFLEHUNTER=$HOME/trufflehunter
    $TRUFFLEHUNTER/node_modules/forever/bin/forever start $TRUFFLEHUNTER/node_modules/nodemon/bin/nodemon.js $TRUFFLEHUNTER/scripts/trufflehunter.js
    
    ## Using "forever start <script>" will fork trufflehunter.js into the background, to act as a daemon.

Connect to Trufflehunter:

    http://$YOUR_IP:8080/index.html



**TODO**
- Error handling of Node.js server, restart if failed (nodemon), log errors.
- Add an init script to start/stop/restart trufflehunter automatically.
- Tighten security.
- Add more error handling to the scripts.
- Password-protect the resulting html files?
- Add a queue for parse jobs, probably unnecessary until there are multiple concurrent users.
- Add more PgBadger options to the form.
- Clean up the code.
- Add a "trap" command to the Bash script to cleanup if the script is aborted.
- Schedule a process to clean up old files. Links are only shortlived.


**Caveats and Bugs**
- The installation process could use some TLC. It would be nicer if everything was bundled together (suggestions welcome!)
- Security and robustness are sorely lacking.
- There is an unhandled issue between the command-line "-n" flag to disable email sending and the config "send_email_link" value.
  Need to fix up which value, the "-n" flag or the .config "send_email_link" value, should take precedence.


**Attribution**
- Trufflehunter name borrowed from C.S. Lewis' Chronicles of Narnia.
- PgBadger: https://github.com/dalibo/pgbadger
- Formidable: https://github.com/felixge/node-formidable
- nodemailer.js: https://github.com/andris9/Nodemailer
- optimist: https://github.com/substack/node-optimist
- Bootstrap: http://getbootstrap.com/
