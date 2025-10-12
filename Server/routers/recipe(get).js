const express = require('express');
const router = express.Router();
const session = require('../sessionHandler.js');
const path = require('path');
const fs = require('fs');

const connection = require('../connectionHandler.js');

router.use(express.json());
router.use(session);

//-----------------------------------------------------------------------------------------
router.get('/', (req, res) => {
    console.log('Action: Show main page ---------------------------------------------------------------------');
    res.sendFile(path.join('build', 'index.html'));
});

//-----------------------------------------------------------------------------------------
router.get('/recipes', (req, res) => {
    const checkUser = req.query.checkUser;
    console.log('Action: Get recipes, checkUser: ' + checkUser + ' ---------------------------------------------------------------------');
    console.log("Session ID when created:", req.sessionID);

    // Define your base SQL query
    let sql = `
        SELECT 
            recipe.recipeID, 
            user.userName, 
            recipe.title, 
            recipe.type, 
            recipe.difficultyLevel, 
            recipe.rating AS totalRating, 
            COUNT(comment.rating) AS commentCount, 
            recipe.releaseDate,
            CASE 
                WHEN COUNT(comment.rating) = 0 THEN 0 
                ELSE recipe.rating / COUNT(comment.rating) 
            END AS rating
        FROM 
            recipe 
        INNER JOIN 
            user ON recipe.userID = user.userID 
        LEFT JOIN 
            comment ON recipe.recipeID = comment.recipeID
    `;

    // Add a WHERE clause if checkUser is 't'
    const params = [];
    if (checkUser === 't') {
        sql += ` WHERE user.userName = ?`;
        params.push(req.session.userName);
    }

    // Add the GROUP BY clause
    sql += `
        GROUP BY 
            recipe.recipeID, 
            user.userName, 
            recipe.title, 
            recipe.type, 
            recipe.difficultyLevel, 
            recipe.rating, 
            recipe.releaseDate
    `;

    // Execute the SQL query
    connection.query(sql, params, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        // Send the results to the client
        res.json(results);
    });
});

//-----------------------------------------------------------------------------------------
router.get('/recipes/:recipeID', (req, res) => {
    // Validate input
    const recipeID = parseInt(req.params.recipeID);
    console.log('Action: Get recpie, recipeID: ' + recipeID + ' ---------------------------------------------------------------------');
    if (!recipeID) {
        return res.status(400).json({ message: 'Invalid ID = ' + req.params.recipeID });
    }

    const sql = `
        SELECT 
            recipe.recipeID AS id, 
            recipe.title AS name, 
            recipe.type AS recipeType, 
            recipe.description, 
            (
                SELECT 
                    JSON_ARRAYAGG(
                        JSON_OBJECT(	
                            'name', recipeIngredient.ingredientName, 
                            'weight_KG', recipeIngredient.weight_KG, 
                            'unitName', recipeIngredient.unitName
                        )
                    )
                FROM recipeIngredient 
                WHERE recipeIngredient.recipeID = recipe.recipeID
            ) AS ingredients, 
            (
                SELECT 
                    JSON_ARRAYAGG(
                        JSON_OBJECT(	
                            'seqID', recipeStep.sequenceID,
                            'content', recipeStep.content
                        )
                    )
                FROM recipeStep 
                WHERE recipeStep.recipeID = recipe.recipeID
            ) AS steps, 
            recipe.cookTime,
            recipe.prepTime, 
            recipe.difficultyLevel, 
            recipe.servingSize,
            recipe.rating, 
            user.userName AS author, 
            recipe.releaseDate AS date,
            (
                SELECT 
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', comment.commentID,
                            'name', user.userName,
                            'rating', comment.rating,
                            'comment', comment.comment,
                            'date', comment.createTime
                        )
                    )
                FROM comment
                INNER JOIN user ON comment.userID = user.userID
                WHERE comment.recipeID = recipe.recipeID
            ) AS comments, 
            recipe.ImageName
        FROM recipe
        INNER JOIN user ON recipe.userID = user.userID
        WHERE recipe.recipeID = ?
    `;
    // Execute the SQL query
    connection.query(sql, [recipeID], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
        let images = [];
        if (results.length > 0 && results[0].ImageName) {
            const baseImageName = results[0].ImageName.substring(0, 15);
            const imageDir = path.join(__dirname, '../images/recipe/');

            // Read all files in the image directory
            const allFiles = fs.readdirSync(imageDir);

            // Filter files that start with the baseImageName
            const matchingFiles = allFiles.filter(file => file.startsWith(baseImageName));

            // Read and collect image data
            for (const fileName of matchingFiles) {
                const imagePath = path.join(imageDir, fileName);
                const imageData = fs.readFileSync(imagePath, 'base64');
                images.push(imageData);
                console.log('Image:', fileName);
                // console.log('Image:', images);
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

//-----------------------------------------------------------------------------------------
router.get('/updateRecipe/:recipeID', (req, res) => {
    // Validate input
    const recipeID = parseInt(req.params.recipeID);
    console.log('Action: Get updateRecipe/:recipeID, recipeID: ' + recipeID + ' ---------------------------------------------------------------------');
    console.log('Session userName:', req.session.userName); // Log the userName from the session
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    }
    if (!recipeID) {
        return res.status(400).json({ message: 'Invalid ID = ' + req.params.recipeID });
    }

    const sql = `
        SELECT 
            recipe.recipeID AS id, 
            recipe.title AS recipeTitle, 
            recipe.type AS recipeType, 
            recipe.description, 
            (
                SELECT 
                    JSON_ARRAYAGG(
                        JSON_OBJECT(	
                            'ingredientName', recipeIngredient.ingredientName,
                            'weight', recipeIngredient.weight_KG
                        )
                    )
                FROM recipeIngredient 
                WHERE recipeIngredient.recipeID = recipe.recipeID
            ) AS ingredients, 
            (
                SELECT 
                    JSON_ARRAYAGG(
                        JSON_OBJECT(	
                            'seqID', recipeStep.sequenceID,
                            'content', recipeStep.content
                        )
                    )
                FROM recipeStep 
                WHERE recipeStep.recipeID = recipe.recipeID
            ) AS steps, 
            recipe.cookTime,
            recipe.prepTime AS prepareTime, 
            recipe.difficultyLevel AS difflvl, 
            recipe.servingSize,
            recipe.ImageName
        FROM recipe
        WHERE recipe.recipeID = ? AND recipe.userID = (SELECT userID FROM user WHERE userName = ?)
    `;
    // Execute the SQL query
    connection.query(sql, [recipeID, req.session.userName], (error, results) => {
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
                imagePath = path.join(__dirname, '../images/recipe/', `${img}.png`);
                if (fs.existsSync(imagePath)) {
                    images.push(fs.readFileSync(imagePath, 'base64'));
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

//-----------------------------------------------------------------------------------------
router.get('/weightUnitOption/:function', (req, res) => {
    console.log('Action: Geting weight unit options ---------------------------------------------------------------------');
    // Validate input
    const validFunctions = 'get_weight_unit_options'; // Replace with your actual functions
    if (!validFunctions.includes(req.params.function)) {
        return res.status(400).json({ message: 'Invalid function' });
    }
    connection.query('SELECT unitName FROM weight_Unit', function (error, results, fields) {
        if (error) throw error;
        if (results.length === 0) {
            return res.json({ message: 'Server error' });
        } else {
            res.json({ results });
        }
    });
});

module.exports = router;