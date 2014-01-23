trufflehunter
=============

A web service to front the handy PgBadger PostgreSQL log parsing tool.
Node.js serves the pages, Formidable parses the form, PgBadger parses the PostgreSQL log files, Mutt sends the email, and it all glued together with some Bash.


**Prerequisites**


**Installation**


**TODO**
- Error handling of Node.js server, restart if failed, log errors.
- Tighten security
- Add more error handling to the scripts
- Password-protect the resulting html files?
- Add a queue for parse jobs -- is this necessary when the work is scheduled via cron?
- Add more PgBadger options to the form
- Clean up the code.
- Add a "trap" command to the Bash script
- Revise so that it is all run by an untrusted user (not root)
- Add checks so that if the disk space is getting low no more files are accepted.
- Schedule a process to clean up old files. Links are only shortlived.



**Attribution**
- Trufflehunter name borrowed from C.S. Lewis' Chronicles of Narnia.
- PgBadger: https://github.com/dalibo/pgbadger
- Node.js form parsing: https://github.com/felixge/node-formidable
