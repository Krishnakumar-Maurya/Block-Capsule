const async = require('hbs/lib/async');
const nodemailer = require('nodemailer')

const sendemail = async(option) => {
    const transporter = nodemailer.createTransport({
        // host: "Gmail", //process.env.Email_Host
        // port: 25,
        host: 'smtp.gmail.com',
        port: 465, // You can also use 587
        secure: true, // Use true for 465, false for 587
        auth: {
          user: "blockcapsule04@gmail.com",
          pass: "ekfe huir nedg nyzp"
        }
      });


      

      const emailOptions = {
        from : 'blockcapsule support<blockcapsule04@gmail.com>',
        to : option.email,
        subject : option.subject,
        text : option.message
      }
      console.log("---last----");
     await transporter.sendMail(emailOptions);
     console.log("---done----");

}

module.exports = sendemail;