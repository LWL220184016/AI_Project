const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
router.use(express.json());

const connection = require('../connectionHandler.js');


// -----------------------------------------------------------------------------------------
router.post('/register', (req, res) => {
    console.log('Action: User registering, recipeID: ---------------------------------------------------------------------');
    // Validate input
    if (!req.body.userName) {
        return res.json({ message: 'PIVUN' }); // Please input a valid username.
    }
    if (!req.body.password) {
        return res.json({ message: 'PIVPW' }); // Please input a valid password.
    }

    let Recipient = "";
    if (req.session.rcode == "success") {
        Recipient = req.session.Recipient;
        req.session.Recipient = "";
        req.session.rcode = "";
    }
    // In a POST request, parameters are usually in the body, not the URL
    const password = req.body.password;
    const userName = req.body.userName;

    // console.log('userName = ' + userName);
    // console.log('password = ' + password);

    // Check if username already exists
    connection.execute('SELECT * FROM user WHERE username = ?', [userName], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            return res.json({ message: 'UAE' }); // Username already exists, please choose another
        } else {
            // Username does not exist, proceed with registration
            const saltRounds = 12;
            bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                if (err) {
                    console.error(err);
                    return;
                }
                // Store hash in your password DB.
                // For example:
                // const user = { userName: req.body.userName, password: hash };

                const insertQuery = 'INSERT INTO user (userName, userPassword, userEmail) VALUES (?, ?, ?)';
                connection.execute(insertQuery, [userName, hash, Recipient], function (error, results, fields) {
                    if (error) throw error;
                    // User was registered successfully
                    return res.json({ message: 'UCS' });
                });
            });
        }
    });
});

module.exports = router;
