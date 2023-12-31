import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'aaronandquinn7@gmail.com',
        clientId: process.env.G_CLIENT_ID,
        clientSecret: process.env.G_CLIENT_SECRET,
        refreshToken: process.env.G_REFRESH_TOKEN,
    },
});

export default async function emailCombinations(address, result) {
    return new Promise((resolve, reject) => {
        let mailOptions = {
            from: 'aaronandquinn7@gmail.com',
            to: address,
            subject: 'Arbitrage Found',
            text: result
        };
        
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                reject(error);
            } else {
                resolve(info.response);
            }
        });
    });
}