const nodemailer = require('nodemailer');


function sendMail(mail) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: mail.from,
            pass: mail.pass
        }
    });

    var mailOptions = {
        from: mail.from,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
    };

    //the response and the socket object 
    transporter.sendMail(mailOptions, function (error, info) {
        console.log(error)
        if (error) {
            mail.ioObj.emit('mailStatus', {
                status: `Mail to ${mail.to} unsuccessful`
            })
            return mail.resObj.status(500).json({
                status: 'Mail send unsuccessful'
            });

        } else {
            mail.ioObj.emit('mailStatus', {
                status: `Mail to ${mail.to} successful`
            })
            return mail.resObj.status(201).json({
                status: 'Mail sent successfully'
            });
        }
    })
};

module.exports = sendMail