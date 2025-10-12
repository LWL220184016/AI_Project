const express = require('express');
const router = express.Router();
const session = require('../sessionHandler.js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const connection = require('../connectionHandler.js');

router.use(express.json());
router.use(session);

// -----------------------------------------------------------------------------------------
router.post('/login', (req, res) => {
    console.log('Action: Login ---------------------------------------------------------------------');
    // Validate input
    if (!req.body.userName) {
        return res.json({ message: 'PIVUN' }); // Please input a valid username.
    }
    if (!req.body.password) {
        return res.json({ message: 'PIVPW' }); // Please input a valid password.
    }

    // In a POST request, parameters are usually in the body, not the URL
    const password = req.body.password;
    const userName = req.body.userName;

    console.log('userName = ' + userName);
    // console.log('password = ' + password);

    // Check if username already exists
    connection.query('SELECT userPassword FROM user WHERE username = ?', [userName], function (error, results, fields) {
        if (error) throw error;
        if (results.length === 0) {
            return res.json({ message: 'LF' }); // Login failed, user name or password not correct.
        } else {
            // console.log(results[0].userPassword);

            // Assuming `user` is an object that represents a user retrieved from your database,
            // and `user.password` is the hashed password
            bcrypt.compare(password, results[0].userPassword, function (err, result) {
                if (err) {
                    // handle error
                    console.error(err);
                    return;
                }
                if (result) { // Passwords match
                    req.session.userName = userName;
                    req.session.loginTime = new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
                    console.log("success, userName = " + req.session.userName); // for debug
                    console.log("Session ID when created:", req.sessionID);
                    res.json({ message: 'success' });

                } else { // Passwords don't match
                    console.log("failed, userName = " + req.session.userName);
                    return res.json({ message: 'LF' }); // Login failed, user name or password not correct.
                }
            });
        }
    });
});

module.exports = router;
