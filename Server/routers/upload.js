const express = require('express');
const router = express.Router();
const multer = require('multer');
const getUpload = require('../uploadHandler.js');
const session = require('../sessionHandler.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');

router.use(express.json());
router.use(express.urlencoded({
    extended: false
}));
router.use(session);

const connection = require('../connectionHandler.js');

// -----------------------------------------------------------------------------------------

router.post('/uploadReceipeImage', async (req, res) => {
    // router.post('/upload', async (req, res) => {
    console.log('Action: Uploading Receipe Image ---------------------------------------------------------------------');
    console.log("Session ID when created:", req.sessionID);
    console.log("req.body:", req.body);
    console.log("req.body.type:", req.body.type);

    if (!req.session.userName) {
        return res.json({ message: 'UNL' }); // User not login.
    }

    const upload = getUpload('recipe');
    upload.array('file')(req, res, function (err) { // Use array('file') to handle multiple files
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
        } else if (err) {
            return res.status(500).json(err);
        }

        const file = req.file; // Access the file from req.file
        res.json({ message: 'File uploaded successfully' });
        // console.log("Request body:", req.body); 
    });

});
// -----------------------------------------------------------------------------------------

router.post('/uploadAvatar', async (req, res) => {
    // router.post('/upload', async (req, res) => {
    console.log('Action: Uploading file ---------------------------------------------------------------------');
    console.log("Session ID when created:", req.sessionID);

    if (!req.session.userName) {
        return res.json({ message: 'UNL' }); // User not login.
    }

    const upload = getUpload('avatar');
    upload.single('file')(req, res, function (err) { // Use single('file') to handle a single file
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
        } else if (err) {
            return res.status(500).json(err);
        }
        const file = req.file; // Access the file from req.file


                // for delete old avatar, but for now, it is will delete new avatar because it is running after the new avatar name updated.
        // connection.query('SELECT avatar FROM user WHERE userName = ?', [req.session.userName], (error, results) => {
        //     if (error) {
        //         console.error(error);
        //         return res.status(500).json({ message: 'Server error' });
        //     }
        //     if (!results.length) {
        //         return res.status(500).json({ message: 'Server error' });
        //     }

        //     fs.unlink(path.resolve(__dirname, '../images/avatar/', results[0].avatar + ".png"), (err) => {
        //         if (err) {
        //             console.error('Error deleting file:', err);
        //             return res.status(500).json({ message: 'Error deleting file', error: err });
        //         }
        //         console.log('File deleted successfully')});
        // });

        res.json({ message: 'File uploaded successfully' });
        // console.log("Request body:", req.body); 
    });

});
// -----------------------------------------------------------------------------------------

router.get('/Dir', (req, res) => {
    const fs = require('fs');

    const directoryPath = './uploads/avatar';

    // Check if the directory exists
    if (fs.existsSync(directoryPath)) {
        console.log('Directory exists.');
        res.json({ message: 'Directory exists.' });

    } else {
        console.log('Directory does not exist.');
        res.json({ message: 'Directory does not exist.' });

    }
});
// -----------------------------------------------------------------------------------------

function waitForImageName(ImageName) {
    return new Promise((resolve) => {
        var loopCount = 0;
        const maxLoopCount = 10; // Define a maximum loop count limit

        const checkInterval = setInterval(() => {
            if (loopCount >= maxLoopCount) { // Check if the loop count has reached the limit
                console.log('Reached maximum loop count. Stopping search for ImageName:', ImageName);
                clearInterval(checkInterval);
                resolve(false); // Resolve the promise with false
                return;
            }

            connection.execute('SELECT 1 FROM recipe WHERE ImageName = ?', [ImageName], function (error, results, fields) {
                if (error) throw error;
                if (results.length > 0) {
                    console.log('Image name is found:', ImageName, " file will be uploaded.");
                    clearInterval(checkInterval);
                    resolve(true); // Resolve with true when the image name is found
                } else {
                    console.log('Image name is not found yet (ImageName: ' + ImageName + '), loop count:', loopCount++);
                }
            });
        }, 500); // check every 500ms
    });
}

module.exports = router;

