trufflehunter
=============

A web front-end to the handy PgBadger PostgreSQL log parsing tool.
Node.js serves the pages, Formidable parses the form, PgBadger parses the PostgreSQL log files, nodemail.js sends the email, and it is all glued together with some Bash.


**Prerequisites and Dependencies**
- npm
- nodemailer
- optimist
- bootstrap
- sendmail, to send notification of completed PgBadger execution.
- trufflehunter.js listens 0 port 80 by default.


**Installation**

- Install node.js. See https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager


Note: these are not complete, nor in order. Some cleanup (and preferably packaging) is required.

    sudo yum install npm
    sudo mkdir -p /usr/share/npm/node_modules
    sudo npm config set registry http://registry.npmjs.org/
    sudo npm --prefix /usr/share/npm/node_modules/ install --production
    sudo npm --prefix /usr/share/npm/node_modules install node --save
    sudo npm --prefix /usr/share/npm/node_modules install formidable --save
    sudo npm --prefix /usr/share/npm/node_modules install nodemon@latest --save
    sudo npm --prefix /usr/share/npm/node_modules install nodemailer --save
    sudo npm --prefix /usr/share/npm/node_modules install optimist --save



**TODO**
- Error handling of Node.js server, restart if failed (nodemon), log errors.
- Add an init script to start/stop/restart trufflehunter automatically.
- Tighten security.
- Add more error handling to the scripts.
- Password-protect the resulting html files?
- Add a queue for parse jobs, probably unnecessary until there are multiple concurrent users.
- Add more PgBadger options to the form.
- Clean up the code.
- Add a "trap" command to the Bash script.
- Revise so that it is all run by an untrusted user (not root)
- Schedule a process to clean up old files. Links are only shortlived.
- Mailing the html file is optional, expose that in the interface


**Caveats and Bugs**
- Has so far been tested on CentOS only.
- Security and robustness are sorely lacking.


**Attribution**
- Trufflehunter name borrowed from C.S. Lewis' Chronicles of Narnia.
- PgBadger: https://github.com/dalibo/pgbadger
- Formidable: https://github.com/felixge/node-formidable
- nodemailer.js: https://github.com/andris9/Nodemailer
- optimist: https://github.com/substack/node-optimist
- Bootstrap: http://getbootstrap.com/
