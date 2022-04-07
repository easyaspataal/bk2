const sendemail = async (toemail, subject, message) => {
    const { google } = require('googleapis');
    const nodemailer = require('nodemailer');

    const CLIENT_ID = '168438088579-d77o04co2nb75sbgqf8lmc1jh01aaiki.apps.googleusercontent.com';
    const CLEINT_SECRET = 'Uq2NNmcKr6uR1LyCZ-zvK4r3';
    const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
    const REFRESH_TOKEN = '1//04cQGDkJNePgMCgYIARAAGAQSNwF-L9Ir7VTRMwbgzqwq2-5nuL-sQNDSlBKhNekIqgBHvvR743sAX6BeTOU5UpmcTrbTGJGTjQs';
    const oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLEINT_SECRET,
        REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'info@easyaspataal.com',
            clientId: CLIENT_ID,
            clientSecret: CLEINT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
        },
    });

    if (subject == 'Patient Payment') {
        var mailOptions = {
            from: 'info@easyaspataal.com',
            to: toemail,
            subject: subject,
            // cc: ['gunjali@easyaspataal.com'],
            html: message,
        };
    }
    else {
        var mailOptions = {
            from: 'info@easyaspataal.com',
            to: toemail,
            subject: subject,
            text: message,
            cc: ['sales-ops@easyaspataal.com', 'prayag@easyaspataal.com']
            // html: '<h1>Hello from gmail email using API</h1>',
        };
    }


    transport.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent');
        }
    });

}

module.exports = sendemail;
