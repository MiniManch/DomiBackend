const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config();

const router = express.Router();

const clientId = process.env.EXPRESS_APP_GMAIL_CLIENT_ID;
const clientSecret = process.env.EXPRESS_APP_GMAIL_CLIENT_SECRET;
const redirectUri = process.env.EXPRESS_APP_GMAIL_REDIRECT_URI;
const refreshToken = process.env.EXPRESS_APP_GMAIL_REFRESH_TOKEN;
const emailUser = process.env.EXPRESS_APP_GMAIL_USERNAME;

const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
oAuth2Client.setCredentials({ refresh_token: refreshToken });

router.post('/sendEmail', async (req, res) => {
    try {
        const { to_email, subject, message } = req.body;

        // Create the email content from the form submission
        const emailContent = `
            Form Submission:
            To Email: ${to_email}
            Subject: ${subject}
            Message: ${message}
        `;

        const accessToken = await oAuth2Client.getAccessToken();
        
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: emailUser,
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: `Your Name <${emailUser}>`,
            to: emailUser, // Send email to yourself
            subject: 'New Form Submission',
            text: emailContent,
        };

        const result = await transport.sendMail(mailOptions);
        console.log('Email sent:', result);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Error sending email. Please try again later.' });
    }
});

module.exports = router;
