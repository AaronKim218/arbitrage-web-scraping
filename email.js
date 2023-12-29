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

let mailOptions = {
    from: 'aaronandquinn7@gmail.com',
    to: 'akimyt2@gmail.com',
    subject: 'Test',
    text: 'Test'
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }
    else{
        console.log('Email sent: ' + info.response);
    }
});