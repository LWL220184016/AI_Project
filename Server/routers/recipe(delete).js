const express = require('express');
const router = express.Router();
const session = require('../sessionHandler.js');

const connection = require('../connectionHandler.js');

router.use(express.json());
router.use(session);

//-----------------------------------------------------------------------------------------

router.delete('/deleteRecipes', (req, res) => {
    const { recipeIDs } = req.body;
    const userName = req.session.userName;

    console.log('Action: Deleting recipes, recipeIDs: ' + recipeIDs + ' ---------------------------------------------------------------------');
    console.log('Session userName:', userName); // Log the userName from the session

    if (!userName) {
        return res.status(400).json({ message: 'Please login.' }); // User not logged in.
    }

    if (!Array.isArray(recipeIDs) || recipeIDs.length === 0) {
        return res.status(400).json({ message: 'No recipes to delete.' }); // No recipes provided.
    }

    // Create placeholders for each recipeID
    const placeholders = recipeIDs.map(() => '?').join(',');

    // Combine recipeIDs and userName into one array for the query parameters
    const queryParams = [...recipeIDs, userName, ...recipeIDs, userName, ...recipeIDs, userName];

    // Start a transaction
    connection.beginTransaction((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }

        const deleteIngredientsSQL = `DELETE recipeIngredient FROM recipeIngredient 
            INNER JOIN recipe ON recipeIngredient.recipeID = recipe.recipeID
            WHERE recipe.recipeID IN (${placeholders}) AND recipe.userID = (SELECT userID FROM user WHERE userName = ?)`;

        const deleteStepsSQL = `DELETE recipeStep FROM recipeStep 
            INNER JOIN recipe ON recipeStep.recipeID = recipe.recipeID
            WHERE recipe.recipeID IN (${placeholders}) AND recipe.userID = (SELECT userID FROM user WHERE userName = ?)`;

        const deleteCommentsSQL = `DELETE comment FROM comment 
            INNER JOIN recipe ON comment.recipeID = recipe.recipeID
            WHERE recipe.recipeID IN (${placeholders}) AND recipe.userID = (SELECT userID FROM user WHERE userName = ?)`;


        const deleteRecipesSQL = `DELETE FROM recipe WHERE recipeID IN (${placeholders}) AND userID = (SELECT userID FROM user WHERE userName = ?)`;

        connection.query(deleteIngredientsSQL, queryParams, (error, results) => {
            if (error) {
                return connection.rollback(() => {
                    console.error(error);
                    return res.status(500).json({ message: 'Server error' });
                });
            }

            connection.query(deleteStepsSQL, queryParams, (error, results) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error(error);
                        return res.status(500).json({ message: 'Server error' });
                    });
                }
                connection.query(deleteCommentsSQL, queryParams, (error, results) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error(error);
                            return res.status(500).json({ message: 'Server error' });
                        });
                    }

                    connection.query(deleteRecipesSQL, queryParams, (error, results) => {
                        if (error) {
                            return connection.rollback(() => {
                                console.error(error);
                                return res.status(500).json({ message: 'Server error' });
                            });
                        }

                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    console.error(err);
                                    return res.status(500).json({ message: 'Server error' });
                                });
                            }

                            console.log(results);
                            // Send the results to the client
                            if (results.affectedRows === 0) {
                                return res.json({ message: 'No recipe found.' });
                            } else if (results.affectedRows > 0) {
                                return res.json({ message: 'Delete successfully.' });
                            } else {
                                return res.json({ message: 'Unknown error.' });
                            }
                        });
                    });
                });
            });
        });
    });
});


module.exports = router;