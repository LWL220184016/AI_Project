const express = require('express');
const router = express.Router();
const session = require('../sessionHandler.js');
const path = require('path');
const fs = require('fs');

const connection = require('../connectionHandler.js');

router.use(express.json());
router.use(session);

// -----------------------------------------------------------------------------------------
router.put('/updateRecipe', (req, res) => {
    console.log('Action: Updating recpie, recipeID: ---------------------------------------------------------------------');
    console.log("Session ID when created:", req.sessionID);

    // Check user is login or not and validate input
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    } else if (!req.body.recipe) {
        return res.json({ message: 'Nothing changed.' }); // Please submit a recipe.
    }

    // In a POST request, parameters are usually in the body, not the URL
    const recipe = req.body.recipe;
    const ingredients = req.body.recipe.ingredients;
    const steps = req.body.recipe.steps;
    const imageName = req.body.imageName;
    console.log('recipe = ', JSON.stringify(recipe, null, 2));
    // console.log('ingredients = ', JSON.stringify(ingredients, null, 2));
    console.log('imageName = ', imageName);

    if (ingredients !== undefined) {
        for (let i = 0; i < ingredients.length; i++) {
            for (let prop of ['weight']) {
                if (ingredients[i][prop] === undefined || isNaN(ingredients[i][prop])) {
                    let PROP = '';
                    if (prop === 'weight') {
                        PROP = 'Weight';
                    }
                    return res.json({ message: PROP + ' can only be a number' });
                }
            }
        }
    }

    ['cookTime', 'prepareTime', 'servingSize', 'difflvl'].forEach(prop => {
        recipe[prop] = Number(recipe[prop]) || 0;
    });

    let fields = [];
    let values = [];

    // Check and add fields to be updated
    if (recipe.recipeTitle) {
        fields.push('title = ?');
        values.push(recipe.recipeTitle);
    }
    if (recipe.recipeType) {
        fields.push('type = ?');
        values.push(recipe.recipeType);
    }
    if (recipe.description) {
        fields.push('description = ?');
        values.push(recipe.description);
    }
    if (recipe.cookTime) {
        fields.push('cookTime = ?');
        values.push(recipe.cookTime);
    }
    if (recipe.prepareTime) {
        fields.push('prepTime = ?');
        values.push(recipe.prepareTime);
    }
    if (recipe.difflvl) {
        fields.push('difficultyLevel = ?');
        values.push(recipe.difflvl);
    }
    if (recipe.servingSize) {
        fields.push('servingSize = ?');
        values.push(recipe.servingSize);
    }
    if (imageName) {
        fields.push('ImageName = ?');
        values.push(imageName);
    }
    values.push(recipe.id, req.session.userName);
    // console.log('fields = ', fields);
    // console.log('values = ', values);

    // Start a transaction
    connection.beginTransaction(function (err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Server error' });
        }
        console.log('updating recipe');
        let sql = 'UPDATE recipe SET ' + fields.join(', ') + ' WHERE recipeID = ? AND userID = (SELECT userID FROM user WHERE userName = ?)';
        console.log('sql = ', sql);
        connection.execute(
            sql,
            values,
            function (error, results) {
                if (error) {
                    console.log(error);
                    return connection.rollback(function () {
                        return res.status(500).json({ message: 'Server error' });
                    });
                }

                const recipeID = recipe.id;
                // Delete existing records for the recipe
                var updateTB = [];
                if (ingredients !== undefined) {
                    updateTB.push('recipeIngredient');
                    console.log('deleting recipeIngredient records');
                    deleteRecords('recipeIngredient', recipeID);
                }
                if (steps !== undefined) {
                    updateTB.push('recipeStep');
                    console.log('deleting recipeStep records');
                    deleteRecords('recipeStep', recipeID);
                }
                if (updateTB.length === 0) {
                    return connection.commit(function (err) {
                        res.json({ message: 'success' });
                        if (err) {
                            return connection.rollback(function () {
                                return res.status(500).json({ message: 'Server error' });
                            });
                        }
                    });
                }

                // Insert new records
                // ingredients
                if (updateTB.includes('recipeIngredient')) {
                    console.log('updating ingredients');
                    for (let i = 0; i < ingredients.length; i++) {
                        if (ingredients[i].ingredientName !== undefined && ingredients[i].ingredientName !== '' &&
                            ingredients[i].weight !== undefined && ingredients[i].weight !== 0 &&
                            ingredients[i].unit !== undefined && ingredients[i].unit !== ''
                        ) {
                            const sqlQuery = 'INSERT INTO recipeIngredient (recipeID, ingredientName, weight_KG) ' +
                                'VALUES (?, ?, ' + 
                                '(SELECT IF(? = 0, 0, IF(operationToKG = \'/\', proportionToKG / ?, IF(operationToKG = \'*\', proportionToKG * ?, ?))) FROM weight_Unit WHERE unitName = ?))';
                            const params = [
                                recipeID,
                                ingredients[i].ingredientName,
                                ingredients[i].weight,
                                ingredients[i].weight,
                                ingredients[i].weight,
                                ingredients[i].weight,
                                ingredients[i].unit
                            ];
                            console.log('Executing SQL Query:', sqlQuery);
                            console.log('With Parameters:', params);
                            connection.execute(
                                sqlQuery,
                                params,
                                function (error) {
                                    if (error) {
                                        console.log(error);
                                        return connection.rollback(function () {
                                            return res.status(500).json({ message: 'Server error' });
                                        });
                                    }
                                }
                            );
                        } else {
                            console.log('updating ingredients failed');
                        }
                    }
                }

                // steps
                if (updateTB.includes('recipeStep')) {
                    console.log('updating steps');
                    for (let i = 0; i < steps.length; i++) {
                        if (steps[i].content !== undefined && steps[i].content !== '') {
                            connection.execute(
                                'INSERT INTO recipeStep (recipeID, sequenceID, content) ' +
                                'VALUES (?, ?, ?)',
                                [
                                    recipeID,
                                    i + 1,
                                    steps[i].content
                                ],
                                function (error) {
                                    if (error) {
                                        console.log(error);
                                        return connection.rollback(function () {
                                            return res.status(500).json({ message: 'Server error' });
                                        });
                                    }
                                }
                            );
                        } else {
                            console.log('updating steps failed');
                        }
                    }
                }

                // Commit the transaction
                connection.commit(function (err) {
                    if (err) {
                        return connection.rollback(function () {
                            return res.status(500).json({ message: 'Server error' });
                        });
                    }

                    return res.json({ message: 'success' });
                });

            }
        );
    });
});

function deleteRecords(db, id) {
    connection.execute(
        `DELETE FROM ${db} WHERE recipeID = ?`,
        [id],
        function (error) {
            if (error) {
                console.log(error);
                return connection.rollback(function () {
                    return res.status(500).json({ message: 'Server error' });
                });
            }
        }
    );
}

module.exports = router;