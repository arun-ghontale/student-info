const nodemailer = require("nodemailer");

function sendMail(mail) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "",
      pass: ""
    }
  });

  var mailOptions = {
    from: "",
    to: "",
    subject: mail.subject,
    text: mail.text,
    attachments: [
      {
        // utf-8 string as an attachment
        filename: "Log.txt",
        content: mail.logStatus
      }
    ]
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = sendMail;
