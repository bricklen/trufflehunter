trufflehunter
=============

A web front end to the handy PgBadger PostgreSQL log parsing tool.
Node.js serves the pages, Formidable parses the form, PgBadger parses the PostgreSQL log files, nodemail.js sends the email, and it is all glued together with some Bash.


**Prerequisites and Dependencies**
- npm
- nodemailer
- optimist
- bootstrap
- Has so far been tested on CentOS only
- sendmail, to send notification of completed PgBadger execution.
- trufflehunter.js listens to port 22089 by default.


**Installation**

CentOS instructions
Note: these are not complete, nor in order. Some cleanup (and preferably packaging) is required.

    sudo apt-get install npm
    sudo mkdir -p /usr/share/npm/node_modules
    sudo npm config set registry http://registry.npmjs.org/
    sudo npm --prefix /usr/share/npm/node_modules/ install --production
    sudo npm --prefix /usr/share/npm/node_modules install node --save
    sudo npm --prefix /usr/share/npm/node_modules install formidable --save
    sudo npm --prefix /usr/share/npm/node_modules install nodemon@latest --save
    sudo npm --prefix /usr/share/npm/node_modules install nodemailer --save
    sudo npm --prefix /usr/share/npm/node_modules install optimist --save


####Directories to hold the files
    mkdir -p /public
    mkdir -p /public/css
    mkdir -p /public/js
    mkdir -p /public/img



**TODO**
- Error handling of Node.js server, restart if failed (nodemon), log errors.
- Add an init script to start/stop/restart trufflehunter automatically
- Tighten security
- Add more error handling to the scripts
- Password-protect the resulting html files?
- Add a queue for parse jobs -- is this necessary when the work is scheduled via cron?
- Add more PgBadger options to the form
- Clean up the code.
- Add a "trap" command to the Bash script
- Revise so that it is all run by an untrusted user (not root)
- Schedule a process to clean up old files. Links are only shortlived.
- Mailing the html file is optional, expose that in the interface



**Attribution**
- Trufflehunter name borrowed from C.S. Lewis' Chronicles of Narnia.
- PgBadger: https://github.com/dalibo/pgbadger
- Formidable: https://github.com/felixge/node-formidable
- nodemailer.js: https://github.com/andris9/Nodemailer
- optimist: https://github.com/substack/node-optimist
- Bootstrap: http://getbootstrap.com/
