import nodemailer from 'nodemailer'

console.log(process.env.USER_EMAIL, process.env.USER_PASS)

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
    },
});

export default transporter