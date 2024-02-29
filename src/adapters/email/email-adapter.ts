import nodemailer from "nodemailer";

export const emailAdapter = {
    send() {

    },
    async sendEmail(email: string, subject: string, message: string) {
        let transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_LOGIN,
                pass: process.env.EMAIL_16_PASSWORD
            }
        })

        let info = await transport.sendMail({
            from: 'mekerial <liprixgremory01@gmail.com>',
            to: email,
            subject: subject,
            html: message
        })
        console.log(info.accepted)

        return info
    }
}