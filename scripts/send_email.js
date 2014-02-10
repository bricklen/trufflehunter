var nodemailer = require('nodemailer');
var argv = require('optimist')
    .usage('Usage: $0 --recipient ["comma-separated list of email addresses"] --url ["http://your.link.com"] --size [bytes]')
    .demand(['recipient','url'])
    .argv;
var from_email = 'user@example.com'; // Change this to something legitimate

// Create a Sendmail transport object
var transport = nodemailer.createTransport("Sendmail", "/usr/sbin/sendmail");
var url = argv.url,
    recipient = argv.recipient,
    bytes = argv.bytes || 'unknown';

    //console.log('Sendmail Configured');

// Message object
var message = {
    from: 'PgBadger Web Service <' + from_email + '>',

    // Comma separated list of recipients
    to: recipient,

    // Subject of the message
    subject: 'PgBadger results',

    // plain-text body
    test:'PgBadger parsed log file results.'+
         'Results: ' + url +
         'Original file size: ' + bytes + ' bytes',

    // HTML body
    html:'<p>PgBadger parsed log file results.</p>'+
         '<p><b>Results:</b> ' + url + '</p>'+
         '<p><b>Original file size:</b> ' + bytes + ' bytes</p>',

};

//console.log('Sending Mail');

transport.sendMail(message, function(error){
    if (error) {
        console.log('Error occured sending email via Nodemailer.');
        console.log(error.message);
        return;
    }
    //console.log('Message sent successfully!');
    transport.close(); // shut down the connection pool, no more messages. Comment this line out to continue sending emails.
});
