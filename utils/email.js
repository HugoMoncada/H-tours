const nodemailer = require("nodemailer");
const pug = require("pug");
const {htmlToText} = require("html-to-text");


module.exports = class Email{
    constructor(user,url){
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url,
        this.from = `Hugo M ${process.env.EMAIL_FROM}`
    }

    newTransport(){

        //// This is for MAILTRAP
        // return nodemailer.createTransport({
        //     host:  process.env.EMAIL_HOST,
        //     port: process.env.EMAIL_PORT,
        //     auth: {
        //         user: process.env.EMAIL_USERNAME,
        //         pass: process.env.EMAIL_PASSWORD,
        //     }
        // });

        // SendGrid 
        return nodemailer.createTransport({
            service: "SendGrid",
            auth: {
                user: process.env.SENDGRID_USERMAIL,
                pass: process.env.SENDGRID_PASSWORD
            }
        });

    }

    async send(template, subject){
        // 1 Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName: this.firstName,
            url: this.url,
            subject
        });


        // 2. Define email options
        const mailOptions =  {
            from: this.from,
            to: this.to,
            subject, 
            html,
            // good practice 
            text: htmlToText(html)
        }

        // 3. Create transport and send email
        
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send("welcome", "Welcome to the natours family!")
    }

    async sendPasswordReset(){
        await this.send("passwordReset", "Your password reset token ( valid only for 10 minutes )");
    }
}


// // Using mail trap to test mails 
// const sendEmail = async (options) => {

//     // 1) Create a transporter
//     const transporter = nodemailer.createTransport({

//         host:  process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD,
//         }
//     });

//     // 2) Define the email options
//     const mailOptions =  {
        
//         from: "Hugo Moncada <VermilionDeveloper@dev.io>",
//         to: options.email,
//         subject: options.subject,
//         text: options.message

//     }

//     // 3) Send the mail
//     await transporter.sendMail(mailOptions);
// }

// module.exports = sendEmail; 