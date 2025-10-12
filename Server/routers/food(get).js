const express = require('express');
const router = express.Router();
const session = require('../sessionHandler.js');
const path = require('path');
const fs = require('fs');

const connection = require('../connectionHandler.js');

router.use(express.json());
router.use(session);

//-----------------------------------------------------------------------------------------
router.get('/foods', (req, res) => {
    console.log('Action: Get foods ---------------------------------------------------------------------');
    console.log("Session ID when created:", req.sessionID);
    // Define your SQL query
    let sql = 'SELECT foodName ' +
        'FROM food'; // Replace with your actual SQL query

    // Execute the SQL query
    connection.query(sql, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        // Send the results to the client
        res.json(results);
    });
});

//-----------------------------------------------------------------------------------------
router.get('/foods/:name', (req, res) => {
    // Validate input
    const foodName = req.params.name;
    console.log('Action: Get recpie, foodName: ' + foodName + ' ---------------------------------------------------------------------');
    if (!foodName) {
        return res.status(400).json({ message: 'Invalid ID = ' + req.params.foodName });
    }

    const sql = `
        SELECT Carbohydrates, Proteins, Fats, Vitamins, Minerals, Water
        FROM food WHERE foodName = ?
    `;
    // Execute the SQL query
    connection.query(sql, [foodName], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
        console.log(results);
        // let images = [];
        // if (results.length > 0 && results[0].ImageName) {
        //     let imagePath;
        //     const imageNames = results[0].ImageName.split(','); // Assuming ImageName is a comma-separated string

        //     for (const img of imageNames) {
        //         imagePath = path.join(__dirname, '../images/food/', `${img}.png`);
        //         if (fs.existsSync(imagePath)) {
        //             images.put(fs.readFileSync(imagePath, 'base64'));
        //         }
        //     }
        // }
        // // Send the results to the client
        // const { ImageName, ...result } = results[0]; // Remove ImageName from results[0]
        // res.json({
        //     ...result,
        //     images // Convert image to base64
        // });
        res.json(results);
    });
});

//-----------------------------------------------------------------------------------------
router.get('/updateFood/:foodID', (req, res) => {
    // Validate input
    const foodID = parseInt(req.params.foodID);
    console.log('Action: Get recpie, foodID: ' + foodID + ' ---------------------------------------------------------------------');
    console.log('Session userName:', req.session.userName); // Log the userName from the session
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    }
    if (!foodID) {
        return res.status(400).json({ message: 'Invalid ID = ' + req.params.foodID });
    }

    const sql = `
        SELECT 
            food.foodID AS id, 
            food.title AS foodTitle, 
            food.type AS foodType, 
            food.description, 
            food.cookTime,
            food.prepTime AS prepareTime, 
            food.difficultyLevel AS difflvl, 
            food.servingSize,
            food.ImageName
        FROM food
        WHERE food.foodID = ?
    `;
    // Execute the SQL query
    connection.query(sql, [foodID, req.session.userName], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
        console.log(results);
        let images = [];
        if (results.length > 0 && results[0].ImageName) {
            let imagePath;
            const imageNames = results[0].ImageName.split(','); // Assuming ImageName is a comma-separated string

            for (const img of imageNames) {
                imagePath = path.join(__dirname, '../images/food/', `${img}.png`);
                if (fs.existsSync(imagePath)) {
                    images.put(fs.readFileSync(imagePath, 'base64'));
                }
            }
        }
        // Send the results to the client
        const { ImageName, ...result } = results[0]; // Remove ImageName from results[0]
        res.json({
            ...result,
            images // Convert image to base64
        });
    });
});


module.exports = router;