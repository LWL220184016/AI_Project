const express = require('express');
const router = express.Router();
const axios = require('axios');
const session = require('../sessionHandler.js');
const path = require('path');
const fs = require('fs');

const connection = require('../connectionHandler.js');
const { error } = require('console');

router.use(express.json());
router.use(session);

//-----------------------------------------------------------------------------------------
router.get('/checkUser', (req, res) => {
    console.log('Action: Checking user ---------------------------------------------------------------------');

    console.log("userName = " + req.session.userName); // for debug
    console.log("Session ID when created:", req.sessionID);
    if (req.session.userName) {
        return res.json({ userName: req.session.userName }); // Logged in.
    } else {
        return res.json({ userName: '' }); // Not logged in.
    }
});

//-----------------------------------------------------------------------------------------
router.get('/getAvatar', (req, res) => {
    console.log('Action: Getting avatar ---------------------------------------------------------------------');
    console.log("Avatar = " + req.session.userName); // for debug
    console.log("Session ID when created:", req.sessionID);
    if (req.session.userName) {
        connection.query('SELECT avatar FROM user WHERE userName = ?', [req.session.userName], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Server error' });
            }
            // Assuming the avatar is a PNG file located in the 'public/avatars' directory
            avatarPath = path.join(__dirname, '../images/avatar/', `${results[0].avatar}1.png`);
            if (!fs.existsSync(avatarPath)) {
                avatarPath = path.join(__dirname, '../images/avatar/avatarDefault.png');
            }
        });
    } else {
        avatarPath = path.join(__dirname, '../images/avatar/avatarDefault.png');
    }
    return res.sendFile(avatarPath);
});

//-----------------------------------------------------------------------------------------
router.get('/logout', (req, res) => {
    console.log('Action: Logout ---------------------------------------------------------------------');

    console.log("logout userName = " + req.session.userName); // for debug
    console.log("Session ID when created:", req.sessionID);

    req.session.destroy(function (err) {
        // session is now destroyed
        if (err) {
            // console.error(`Session save error: ${err}`);
            return res.status(500).json({ message: 'Server error' });
        }
    });

    return res.json({ message: 'ok' });
});

//-----------------------------------------------------------------------------------------
router.get('/userDetails', (req, res) => {
    console.log('Action: Getting user data ---------------------------------------------------------------------');

    console.log("userName = " + req.session.userName); // for debug
    console.log("Session ID when created:", req.sessionID);

    if (req.session.userName) {
        let sql = 'SELECT userName, userEmail, avatar, accCreationDate, country ' +
            'FROM user WHERE user.userName = ?'; // Replace with your actual SQL query

        // Execute the SQL query
        connection.query(sql, [req.session.userName], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Server error' });
            }
            console.log(results);

            // Send the results to the client
            res.json(results);
        });
    } else {
        return res.json({ userName: '' }); // Not logged in.
    }
});

//-----------------------------------------------------------------------------------------
router.put('/updateProfile', async (req, res) => {
    console.log('Action: Updating user data ---------------------------------------------------------------------');

    console.log("userName = " + req.session.userName); // for debug
    console.log("Session ID when created:", req.sessionID);
    console.log("user = ", req.body.user); // for debug

    const user = req.body.user;

    if (!req.session.userName) {
        return res.json({ userName: '' }); // Not logged in.
    }

    if (!user || !user.userName || user.userName.trim() === '') {
        return res.json({ message: 'User name could not be empty.' });
    }

    let Recipient = "";
    if (req.session.rcode == "success") {
        Recipient = req.session.Recipient;
        req.session.Recipient = "";
        req.session.rcode = "";
    }

    try {
        // Check if the user name user want to change already exists
        const [existingUser] = await connection.promise().query(
            'SELECT userName FROM user WHERE userName = ?',
            [user.userName]
        );

        if (existingUser.length > 0 && existingUser[0].userName !== req.session.userName) {
            return res.json({ message: 'User name already exists.' });
        }

        // Get the userID for change user data
        const [userResult] = await connection.promise().query(
            'SELECT userID FROM user WHERE userName = ?',
            [req.session.userName]
        );

        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userID = userResult[0].userID;

        // Execute the SQL query
        await connection.promise().execute(
            `UPDATE user SET userName = ?, userEmail = ?, avatar = ?, country = ? WHERE userID = ?`,
            [
                user.userName,
                Recipient || '',
                req.body.imageName || '',
                user.country || '',
                userID
            ]
        );
        req.session.userName = user.userName;
        return res.json({ message: 'success' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;