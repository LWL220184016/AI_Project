const express = require('express');
const router = express.Router();
const session = require('../sessionHandler.js');
require('dotenv').config();

router.use(express.json());
router.use(session);

const nodemailer = require('nodemailer');

// Create a transporter
let transporter = nodemailer.createTransport({
    service: 'gmail', // replace with your email service
    auth: {
        user: process.env.EMAIL_USERNAME, // replace with your email username
        pass: process.env.EMAIL_PASSWORD // replace with your email password
    }
});
//-----------------------------------------------------------------------------------------
router.post('/sendVerifyCode', (req, res) => {
    console.log('Action: Sending email verify code ---------------------------------------------------------------------');
    // Validate input
    if (req.session.rcode == "success") {
        return res.json({ message: 'Email (Email verification has succeeded.)' }); // Email verification has succeeded.
    }
    const now = Date.now();
    if (req.session.lastSent && now - req.session.lastSent < 60000) {
        return res.json({ message: 'Email (Too many requests. Please wait for a minute.)' }); // Too many requests. Please wait for a minute.
    }
    const validFunctions = ['send_verification_code']; // Replace with your actual functions
    if (!validFunctions.includes(req.body.functionParam)) {
        return res.status(400).json({ message: 'Invalid function' });
    }
    if (req.body.Recipient == '') {
        return res.json({ message: 'Email (Please input a valid email.)' }); // Please input a valid email.
    }
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if(!emailPattern.test(req.body.Recipient)) {
        return res.json({ message: 'Email (Email is not valid.)' }); // Email is not valid.
    }
    const froms = ['nu', 'fp'];
    if (!froms.includes(req.body.from)) { 
        return res.status(400).json({ message: 'What your purpose? (nr = new recipe, nu = new user)'});
    }

    // In a POST request, parameters are usually in the body, not the URL
    const Recipient = req.body.Recipient;
    req.session.Recipient = Recipient;
    
    let randomNum = getRandomInt(10, 99);
    req.session.rcode = randomNum;
    req.session.cookie.maxAge = 1500000; // available in 15 minutes
    // req.session.cookie.maxAge = 20000; // available in 20 seconds
    // Send an email with the verification code
    let mailOptions = {
        from: process.env.EMAIL_USERNAME, // sender address
        to: Recipient, // list of receivers
        subject: 'Verification code of food information sharing platform', // Subject line
        text: `Your verification code is ${randomNum}` // plain text body
    };
    console.log('Email Username:', process.env.EMAIL_USERNAME);
    console.log('Email Password:', process.env.EMAIL_PASSWORD ? 'Loaded' : 'Not Loaded');
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        return res.json({ message: 'Email (Verification code has been sent.)' }); // Email is not valid.
    });
});

//-----------------------------------------------------------------------------------------
router.post('/verifyEmail', (req, res) => {
    console.log('Action: Verifying email ---------------------------------------------------------------------');
    const vcode = req.body.vcode;

    // rcode is the verification code sent to the user, if it is not set, the user has not requested a verification code
    if (!req.session.rcode) {
        return res.json({ message: 'Email (Input your email and click the "send" button.)'}); // Input your email and click the "send" button.
    }
    if (req.session.rcode == 'success') {
        return res.json({ message: 'Email (Email Verification success.)' }); // Email Verification success.
    }
    console.log('rcode:', req.session.rcode);
    console.log('vcode:', vcode);
    if (vcode == req.session.rcode) {
        console.log('Email Verification success.');
        req.session.rcode = 'success';
        return res.json({ message: 'Email (Email Verification success.)' }); // Email verification success
    } else {
        return res.json({ message: 'Email (Invalid verification code.)' }); // Email verification failed, please try again
    }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = router;
