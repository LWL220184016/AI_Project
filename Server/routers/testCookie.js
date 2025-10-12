// this is work
const express = require('express');
const router = express.Router();

router.use(express.json());

//-----------------------------------------------------------------------------------------
router.get('/testCookie', (req, res) => {
    const cookieName = "testCookie";
    const cookieValue = "testCookie";
    console.log("testCookie");

    // Set the cookie
    res.cookie(cookieName, cookieValue, { secure: true, httpOnly: false });

    // Send a response
    res.send('Cookie has been set');
});

//-----------------------------------------------------------------------------------------

module.exports = router;
