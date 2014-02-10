trufflehunter
=============

A web front-end to the handy PgBadger PostgreSQL log parsing tool.
Node.js serves the pages, Formidable parses the form, PgBadger parses the PostgreSQL log files, nodemail.js sends the email, and it is all glued together with some Bash.


**Prerequisites**
- node.js - See https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
- npm

**Dependencies**
- bootstrap
- sendmail, to send notification of completed PgBadger execution.
- trufflehunter.js listens on port 80 by default.


**Installation**

Note: these steps may not be complete. Some cleanup (and preferably packaging) is desired.

    ## Depending on which OS and how node and npm were installed, some permissions might need to be changed.
    sudo chmod a+rw -R /usr/share/npm
    sudo chmod a+x -R /usr/share/npm/node_modules/*
    
    sudo npm config set registry http://registry.npmjs.org/
    export NODE_MODULES=$HOME/trufflehunter/node_modules
    npm --prefix $NODE_MODULES install -g node --save
    npm --prefix $NODE_MODULES install -g nodemon@latest --save
    npm --prefix $NODE_MODULES install formidable@latest --save
    npm --prefix $NODE_MODULES install nodemailer@latest --save
    npm --prefix $NODE_MODULES install optimist@latest --save
    npm --prefix $NODE_MODULES install semver@latest --save
    npm --prefix $NODE_MODULES install npm-registry-client@latest --save
    
    # In Ubuntu 13.10, I had to create a symlink to node if not using the "install -g" flag.
    # sudo ln -s /usr/bin/nodejs /usr/bin/node


**Usage**

Determine the IP you are going to connect to, to serve the trufflehunter web page. Some methods (depending on your linux distro) include:

    hostname -I
    /sbin/ip a

If you are serving Trufflehunter internally only, then it probably makes sense to use only the internal IP. If you are exposing it to users outside of your network, then you will probably need to use the external IP (and add firewall rules and lock down the trufflehunter directory!)

Start the node server to listen for connections:

    sudo $HOME/trufflehunter/node_modules/nodemon/bin/nodemon.js $HOME/trufflehunter/scripts/trufflehunter.js

Connect to Trufflehunter:

    http://$YOUR_IP/index.html



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
- The installation process stinks. It would be nicer if everything was bundled together (suggestions welcome!)
- Security and robustness are sorely lacking.


**Attribution**
- Trufflehunter name borrowed from C.S. Lewis' Chronicles of Narnia.
- PgBadger: https://github.com/dalibo/pgbadger
- Formidable: https://github.com/felixge/node-formidable
- nodemailer.js: https://github.com/andris9/Nodemailer
- optimist: https://github.com/substack/node-optimist
- Bootstrap: http://getbootstrap.com/
