// Author: Bricklen
// Trufflehunter project home: https://github.com/bricklen/trufflehunter

var http = require('http'),
    util = require('util'),
    formidable = require('../node_modules/formidable'),
    server,
    serverport = 80, //22089,
    fs = require('fs');
    path = require("path"),
    extensions = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".png": "image/png",
        ".gif": "image/gif",
        ".jpg": "image/jpeg",
        ".log": "text/plain",
        ".gz": "application/x-gzip"
    };
var rootpath = __dirname,
    uploadDir = rootpath + '../public/uploads',
    config_file, fname, dir, ext;

// TODO: Add security measures to prevent users from reading other directories.

server = http.createServer(function(req, res) {

    var fname = path.basename(req.url) || "index.html",
        dir = path.dirname(req.url).substring(1),
        ext = path.extname(fname);

    if (req.url == '/') {
        res.writeHead(200, {'content-type': 'text/html'});
        fs.readFile(rootpath + '../public/' + fname,function(error,data) { 
            res.end(data);
        });

    } else if (req.url == '/upload') {
        var form = new formidable.IncomingForm(),
            files = [],
            fields = [],
            stream, filename, filename_no_ext, log_line_prefix, email, top_num_queries, send_email_link,
            randomnumber = Math.floor(Math.random()*100000);

        form.uploadDir = uploadDir;

        form
            .on('field', function(field, value) {
                // All input fields of the form MUST be processed here if they
                // will be used in the .config file, so if you add any to the
                // form, then add them here too.
                // Note: add the form elements "on ('end..." section too.

                fields.push([field, value]);
                if ( field == 'log_line_prefix' ) {
                    log_line_prefix = value;
                }
                if ( field == 'email' ) {
                    email = value;
                }
                if ( field == 'top_num_queries' ) {
                    top_num_queries = value;
                }
                if ( field == 'send_email_link' ) {
                    send_email_link = value;
                }
            })

            /* This is where the renaming happens */
            .on ('fileBegin', function(name, file){
                //if ( email == 'undefined' || email == '' || log_line_prefix == 'undefined' || log_line_prefix == '' ) {
                //    console.log('Some inputs are missing. Exiting...');
                //    // TODO: This is not stopping the upload if for example just the email is supplied but the log_line_prefix is not.
                //    // It should stop the upload and redirect to the main page, preferably with a message stating that there are missing values.
                //    // This should also be handled in the form itself, before we get this far.
                //    req.pause();
                //    // The redirect page should be the root, not some html page that I have hardcoded.
                //    res.writeHead(301, {'content-type': 'text/html', 'location' : req.url + '/../index.html'});
                //    res.end();
                //}

                //Rename the incoming file to the file's name
                filename = file.name;
                ext = path.extname(filename);
                filename = filename.replace(/\s+/g,"_");                    // Replace spaces with underscores
                filename = filename.substr(0, filename.lastIndexOf("."));   // Strip the extension
                filename_no_ext = filename + '_' + randomnumber;            // New filename, try make it unique
                filename = filename + '_' + randomnumber + ext;             // Put the extension back on
                file.path = form.uploadDir + '/' + filename;
                config_file = form.uploadDir + '/' + filename + '.config';  // Create the xxx.config filename
            })

            .on('file', function(field, file) {
                files.push([field, file]);
            })

            // Informational only, can be commented out
            .on('progress', function(bytesReceived, bytesExpected) {
                var percent = Math.ceil(bytesReceived / bytesExpected * 100) || 0;
                process.stdout.write('Uploading: %' + percent + '\r');
            })

            .on('end', function() {
                // Create the .config file.
                // This is done *after* the log file has been uploaded so that the
                // scheduled parse process only parses log files after the full log has
                // been uploaded AND the config has been created.
                // Do not move this step before the upload unless a mutex is added.
                stream = fs.createWriteStream(config_file);
                stream.once('open', function(fd) {

                // Ideally this would be a loop over the fields from the "field" section further up
                stream.write('log_line_prefix="' + log_line_prefix + '"' + "\n");
                stream.write('email="' + email + '"' + "\n");
                stream.write('logfile="' + filename + '"' + "\n");
                stream.write('top_num_queries="' + top_num_queries + '"' + "\n");
                stream.write('send_email_link="' + send_email_link + '"' + "\n");

                stream.end();
            });

            res.writeHead(200, {'content-type': 'text/html'});
            res.write('<html>');
            res.write('<head><title>Redirect to generated HTML results</title>');
            res.write('<script language="javascript" type="text/javascript" src="//code.jquery.com/jquery-1.11.0.min.js"></script>');
            res.write('<script type="text/javascript">');
            res.write('//<![CDATA[');
            res.write('$(window).load(function() { $("#spinner").fadeOut("slow"); })');
            res.write('//]]>');
            res.write('</script>');
            res.write('<script language="Javascript">');
            res.write('var timeOutId = 0;');
            res.write('function getResults() {');
            res.write('    $.ajax({');
            res.write('       type: "POST",');
            res.write('       url: "/uploads/' + filename_no_ext + '.html' + '",');
            res.write('       data : {},');
            res.write('       dataType: "html",');
            res.write('       cache: false,');
            res.write('       success: function(response){');
            res.write('         if (response != "" && response != "undefined") {');
            res.write('             window.location.href = "/uploads/' + filename_no_ext + '.html' + '";');
            res.write('         } else {');
            res.write('            timeOutId = setTimeout(getResults, 2000);');
            res.write('         }');
            res.write('       },');
            res.write('       error: function(jqXHR, textStatus, errorThrown){');
            res.write('         console.log(jqXHR);');
            res.write('         console.log(errorThrown);');
            res.write('       }');
            res.write('     });');
            res.write('};');
            res.write('getResults();');
            res.write('</script>');
            res.write('<link href="http://fonts.googleapis.com/css?family=Trykker|Bubbler+One" rel="stylesheet" type="text/css">');
            res.write('<style type="text/css">');
            res.write('body{');
            res.write('font-family: "Trykker", "Bubbler One", "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif;');
            res.write('font-size:12px;');
            res.write('}');
            res.write('#spinner {');
            res.write('position: fixed;');
            res.write('left: 0px;');
            res.write('top: 0px;');
            res.write('width: 100%;');
            res.write('height: 100%;');
            res.write('z-index: 9999;');
            res.write('background: url(/public/img/ajax_loader_green_128.gif) 50% 50% no-repeat #ede9df;');
            res.write('}');
            res.write('</style>');
            res.write('</head>');
            res.write('<body>');
            res.write('<div id="spinner"></div>');
            res.write('When your generated HTML file is finished you will be redirected automatically.');
            res.write('</body>');
            res.write('</html>');
            res.end();
        });

        form.parse(req);

    } else if (ext === '.html') {
        // TODO: Tighten this up so other html files in other directories cannot be read
        res.writeHead(200, {'content-type': 'text/html'});
        fs.readFile(rootpath + '/' + req.url,function(error,data){
            res.end(data);
        });

    // TODO: Clean up the conditional statements for extensions, bundle them up
    //       and have them processed dynamically, except where there are custom
    //       scripts that need handling.
    } else if (ext === '.js') {
// This stuff is unnecessary.
//        fs.readFile(__dirname + '/public/js/jquery-1.11.0.js', function (err, data) {
//            if (err) console.log(err);
//            res.writeHead(200, {'Content-Type': 'text/javascript'});
//            res.write(data);
//            res.end(data);
//        });

    } else if (ext === '.css') {
        fs.readFile(__dirname + '/public/css/style.css', function (err, data) {
            if (err) console.log(err);
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.write(data);
            res.end(data);
        });

    } else if (ext === '.gif') {
        fs.readFile(__dirname + '/public/img/' + fname, function (err, data) {
            if (err) console.log(err);
            res.writeHead(200, {'Content-Type': 'image/gif'});
            res.write(data);
            res.end(data);
        });

    } else {
        res.writeHead(404, {'content-type': 'text/plain'});
        res.end('404');
    }
});
server.listen(serverport);

console.log('Listening on port:' + serverport );
