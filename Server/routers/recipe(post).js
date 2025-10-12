const express = require('express');
const router = express.Router();
const session = require('../sessionHandler.js');
const connection = require('../connectionHandler.js');

router.use(express.json());
router.use(session);

// -----------------------------------------------------------------------------------------
router.post('/releaseRecpie', (req, res) => {
    console.log('Action: Releasing recpie, recipeID: ---------------------------------------------------------------------');
    console.log("Session ID when created:", req.sessionID);
//upload image problem, step and ingredient cannot upload image, and 1.jpg upload by recipe, name is not correct
    // Check user is login or not and alidate input
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    } else if (!req.body.recipe) {
        return res.json({ message: 'Please submit a recipe.' }); // Please submit a recipe.
    } else if (!req.body.recipe.recipeTitle || req.body.recipe.recipeTitle === '') {
        return res.json({ message: 'Please input a title.' }); // Please input a title.
    }

    // In a POST request, parameters are usually in the body, not the URL
    const recipe = req.body.recipe;
    const ingredients = req.body.recipe.ingredients;
    const steps = req.body.recipe.steps;
    const imageName = req.body.imageName;

    console.log('recipe = ', JSON.stringify(recipe, null, 2));
    console.log('ingredients = ', JSON.stringify(ingredients, null, 2));
    console.log('imageName = ', imageName);

    ['cookTime', 'prepareTime', 'servingSize', 'difflvl'].forEach(prop => {
        recipe[prop] = Number(recipe[prop]) || 0;
    });

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


    var RID = 0;
    connection.execute(
        'INSERT INTO recipe (' +
        'userID, title, type, description, cookTime, prepTime, difficultyLevel, servingSize, imageName' +
        ') VALUES ((SELECT userID FROM user WHERE userName = ?), ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            req.session.userName, // Assuming the userName is a property of the recipe object
            recipe.recipeTitle,
            recipe.recipeType,
            recipe.description,
            recipe.cookTime,
            recipe.prepareTime,
            recipe.difflvl,
            recipe.servingSize,
            imageName.substring(0, 15)
        ],
        function (error, results) {
            if (error) {
                throw error;
            } else {
                RID = results.insertId;
                req.session.recipeID = RID; // Set the session value here
                req.session.save(function (err) {
                    if (err) {
                        // console.error(`Session save error: ${err}`);
                        return res.status(500).json({ message: 'Server error' });
                    }
                });

                console.log('Recipe ID: ', req.session.recipeID, ', insertId: ', results.insertId);
                // ingredients
                if (ingredients !== undefined && ingredients.length > 0) {
                    console.log('ingredients.length: ', ingredients.length, ', [0]: ', ingredients[0].ingredientName);

                    for (let i = 0; i < ingredients.length; i++) {
                        if (ingredients[i].ingredientName !== undefined && ingredients[i].ingredientName !== '' &&
                            ingredients[i].weight !== undefined && ingredients[i].weight !== 0 &&
                            ingredients[i].unit !== undefined && ingredients[i].unit !== ''
                        ) {
                            connection.execute(
                                'INSERT INTO recipeIngredient (recipeID, ingredientName, weight_KG, unitName) ' +
                                'VALUES (?, ?, ?, ?)',
                                [
                                    results.insertId,
                                    ingredients[i].ingredientName,
                                    ingredients[i].weight,
                                    ingredients[i].unit
                                ],
                                function (error) {
                                    if (error) {
                                        throw error;
                                    }
                                }
                            );
                        }
                    }
                }
                // steps
                if (steps !== undefined && steps.length > 0) {
                    for (let i = 0; i < steps.length; i++) {
                        if (steps[i].content) {
                            connection.execute(
                                'INSERT INTO recipeStep (recipeID, sequenceID, content) ' +
                                'VALUES (?, ?, ?)',
                                [
                                    results.insertId,
                                    i + 1,
                                    steps[i].content
                                ],
                                function (error) {
                                    if (error) {
                                        throw error;
                                    }
                                }
                            );
                        }
                    }
                }

                // delete recipe draft from draft table
                console.log('Deleting draft, req.session.draftID: ', req.session.draftID);
                console.log('Deleting draft, req.body.draftID: ', req.body.recipe.draftID);
                const draftID = req.session.draftID ? req.session.draftID : req.body.recipe.draftID;
                connection.execute(
                    'DELETE FROM draft WHERE draftID = ?',
                    [draftID],
                    function (error) {
                        if (error) {
                            throw error;
                        }
                    }
                );  //now to do: fix ingredients name may throw error to stop the server when it is not found in database.

                return res.json({ message: 'success' });
            }
        }
    );
});

// // -----------------------------------------------------------------------------------------
// router.put('/updateRecpie', (req, res) => {
//     console.log('Action: Updating recpie, recipeID: ---------------------------------------------------------------------');
//     console.log("Session ID when created:", req.sessionID);

//     // Check user is login or not and validate input
//     if (!req.session.userName) {
//         return res.json({ message: 'Please login.' }); // User not login.
//     } else if (!req.body.recipe) {
//         return res.json({ message: 'Nothing changed.' }); // Please submit a recipe.
//     }

//     // In a POST request, parameters are usually in the body, not the URL
//     const recipe = req.body.recipe;
//     const ingredients = req.body.recipe.ingredients;
//     const steps = req.body.recipe.steps;
//     const imageName = req.body.imageName;
//     console.log('recipe = ', JSON.stringify(recipe, null, 2));
//     console.log('ingredients = ', JSON.stringify(ingredients, null, 2));
//     console.log('imageName = ', imageName);

//     ['cookTime', 'prepareTime', 'servingSize'].forEach(prop => {
//         if (!isNaN(recipe[prop]) || recipe[prop] === undefined || recipe[prop] === '') {
//             recipe[prop] = 0;
//         }
//     });

//     if (ingredients !== undefined) {
//         for (let i = 0; i < ingredients.length; i++) {
//             for (let prop of ['weight']) {
//                 if (ingredients[i][prop] === undefined || isNaN(ingredients[i][prop])) {
//                     let PROP = '';
//                     if (prop === 'weight') {
//                         PROP = 'Weight';
//                     }
//                     return res.json({ message: PROP + ' can only be a number' });
//                 }
//             }
//         }
//     }

//     let fields = [];
//     let values = [];

//     // Check and add fields to be updated
//     if (recipe.recipeTitle) {
//         fields.push('title = ?');
//         values.push(recipe.recipeTitle);
//     }
//     if (recipe.recipeType) {
//         fields.push('type = ?');
//         values.push(recipe.recipeType);
//     }
//     if (recipe.description) {
//         fields.push('description = ?');
//         values.push(recipe.description);
//     }
//     if (recipe.cookTime) {
//         fields.push('cookTime = ?');
//         values.push(recipe.cookTime);
//     }
//     if (recipe.prepareTime) {
//         fields.push('prepTime = ?');
//         values.push(recipe.prepareTime);
//     }
//     if (recipe.difflvl) {
//         fields.push('difficultyLevel = ?');
//         values.push(recipe.difflvl);
//     }
//     if (recipe.servingSize) {
//         fields.push('servingSize = ?');
//         values.push(recipe.servingSize);
//     }
//     if (imageName) {
//         fields.push('imageName = ?');
//         values.push(imageName);
//     }
//     values.push(recipe.recipeID, req.session.userName);

//     // Start a transaction
//     connection.beginTransaction(function (err) {
//         if (err) {
//             return res.status(500).json({ message: 'Server error' });
//         }

//         // Construct the SQL query
//         let sql = 'UPDATE recipe SET ' + fields.join(', ') + ' WHERE recipeID = ? AND userID = (SELECT userID FROM user WHERE userName = ?)';
//         connection.execute(
//             sql,
//             values,
//             function (error, results) {
//                 if (error) {
//                     return connection.rollback(function () {
//                         return res.status(500).json({ message: 'Server error' });
//                     });
//                 }

//                 const recipeID = recipe.recipeID;

//                 var updateTB = [];
//                 if (ingredients !== undefined && ingredients.length > 0) {
//                     updateTB.push('recipeIngredient');
//                 }
//                 if (steps !== undefined && steps.length > 0) {
//                     updateTB.push('recipeStep');
//                 }

//                 // Delete existing records for the recipe
//                 connection.execute(
//                     `DELETE FROM ${updateTB.join(", ")} WHERE recipeID = ?`,
//                     [recipeID],
//                     function (error) {
//                         if (error) {
//                             return connection.rollback(function () {
//                                 return res.status(500).json({ message: 'Server error' });
//                             });
//                         }

//                         // Insert new records
//                         // ingredients
//                         if (updateTB.includes('recipeIngredient')) {
//                             for (let i = 0; i < ingredients.length; i++) {
//                                 if (ingredients[i].ingredientName !== undefined && ingredients[i].ingredientName !== '' &&
//                                     ingredients[i].weight !== undefined && ingredients[i].weight !== 0 &&
//                                     ingredients[i].unit !== undefined && ingredients[i].unit !== ''
//                                 ) {
//                                     connection.execute(
//                                         'INSERT INTO recipeIngredient (recipeID, ingredientName, weight_KG) ' +
//                                         'VALUES (?, ?, ' +
//                                         '(SELECT IF(? = 0, 0, IF(operationToKG = \' / \', proportionToKG / ?, IF(operationToKG = \' * \', proportionToKG * ?, ?))) FROM weight_Unit WHERE unitName = ?))',
//                                         [
//                                             recipeID,
//                                             ingredients[i].ingredientName,
//                                             ingredients[i].weight,
//                                             ingredients[i].weight,
//                                             ingredients[i].weight,
//                                             ingredients[i].weight,
//                                             ingredients[i].unit
//                                         ],
//                                         function (error) {
//                                             if (error) {
//                                                 return connection.rollback(function () {
//                                                     return res.status(500).json({ message: 'Server error' });
//                                                 });
//                                             }
//                                         }
//                                     );
//                                 }
//                             }
//                         }

//                         // steps
//                         if (updateTB.includes('recipeStep')) {
//                             for (let i = 0; i < steps.length; i++) {
//                                 if (steps[i].content) {
//                                     connection.execute(
//                                         'INSERT INTO recipeStep (recipeID, sequenceID, content) ' +
//                                         'VALUES (?, ?, ?)',
//                                         [
//                                             recipeID,
//                                             i + 1,
//                                             steps[i].content
//                                         ],
//                                         function (error) {
//                                             if (error) {
//                                                 return connection.rollback(function () {
//                                                     return res.status(500).json({ message: 'Server error' });
//                                                 });
//                                             }
//                                         }
//                                     );
//                                 }
//                             }
//                         }

//                         // Commit the transaction
//                         connection.commit(function (err) {
//                             if (err) {
//                                 return connection.rollback(function () {
//                                     return res.status(500).json({ message: 'Server error' });
//                                 });
//                             }

//                             return res.json({ message: 'success' });
//                         });
//                     }
//                 );
//             }
//         );
//     });
// });

module.exports = router;
