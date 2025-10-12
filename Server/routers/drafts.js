const express = require('express');
const router = express.Router();
const session = require('../sessionHandler.js');
const connection = require('../connectionHandler.js');

require('dotenv').config();

router.use(express.json());
router.use(session);

//-----------------------------------------------------------------------------------------
router.get('/getRecipeDraftsList', (req, res) => {
    console.log('Action: Geting recipe drafts list ---------------------------------------------------------------------');
    // Validate input
    // when user click 'New Recipe' button or reload the page.
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    }

    connection.query(`SELECT draftID, JSON_EXTRACT(data, '$.RecipeTitle') AS RecipeTitle, createTime, lastUpdateTime 
            FROM draft WHERE userID = (SELECT userID FROM user WHERE userName = ?) AND type = ?`,
        [
            req.session.userName,
            "recipe"
        ],
        function (error, results, fields) {
            if (error) throw error;
            if (results.length === 0) {
                return res.json({ message: 'No draft found.' });
            } else {
                res.json({ results });
            }
        });
});

//-----------------------------------------------------------------------------------------
router.get('/getRecipeDraftData/:id', (req, res) => {
    console.log('Action: Geting recipe draft data ---------------------------------------------------------------------');
    // Validate input
    const id = parseInt(req.params.id, 10);
    // const id = 71;
    console.log('ID: ', id);

    if (!id){
        return res.json({ message: 'No draft selected.' });
    }

    req.session.draftID = null; // for create a new draft, because client will sent this request 
    // when user click 'New Recipe' button or reload the page.
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    }

    connection.query('SELECT draftID, data FROM draft WHERE userID = (SELECT userID FROM user WHERE userName = ?) AND draftID = ?',
        [
            req.session.userName,
            id
        ],
        function (error, results, fields) {
            if (error) throw error;
            if (results.length === 0) {
                return res.json({ message: 'No draft found.' });
            } else {
                res.json({ results });
            }
        });
});

// -----------------------------------------------------------------------------------------
router.post('/saveDraft', (req, res) => {
    console.log('Action: draft upload request ---------------------------------------------------------------------');
    console.log("Session ID when created:", req.sessionID);
    console.log("req.body: ", req.body);

    // Check user is login or not and alidate input
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    }
    type = req.body.type;
    data = req.body.data;

    console.log("data.draftID: ", data.draftID);
    console.log("req.session.draftID: ", req.session.draftID);
    if (Array.isArray(data.steps)) {
        data.steps = data.steps.map(step => {
            return Object.fromEntries(Object.entries(step).filter(([key, value]) => key !== "id"));
        });
    }
    // Filter out 'id' key from each object in the ingredients array
    if (Array.isArray(data.ingredients)) {
        data.ingredients = data.ingredients.map(ingredient => {
            return Object.fromEntries(Object.entries(ingredient).filter(([key, value]) => key !== "id"));
        });
    }

    if (!data.draftID) {
        console.log('Action: inserting new recpie draft, recipeID: >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

        connection.execute(
            'INSERT INTO draft (userID, type, data, lastUpdateTime) VALUES ((SELECT userID FROM user WHERE userName = ?), ?, ?, ?)',
            [
                req.session.userName,
                type,
                data,
                new Date()
            ],
            function (error, results) {
                // console.log("error: ", error);
                // console.log("results: ", results);
                if (error) {
                    console.error('Error inserting draft:', error);
                    return res.status(500).json({ message: 'Server error' });
                } else {
                    req.session.draftID = results.insertId; // Set the session value here
                    console.log("req.session.draftID after insert: ", req.session.draftID);
                    req.session.save(function (err) {
                        if (err) {
                            console.error('Session save error:', err);
                            return res.status(500).json({ message: 'Server error' });
                        }
                        console.log("Session saved successfully.");
                        res.json({ message: 'Draft created successfully.' });
                    });
                }
            }
        );
    } else {
        res.json({ message: 'Draft create failed.' });
    }
});

// -----------------------------------------------------------------------------------------
router.put('/saveDraft', (req, res) => {
    console.log('Action: draft upload request ---------------------------------------------------------------------');
    console.log("Session ID when created:", req.sessionID);
    console.log("req.body: ", req.body);

    // Check user is login or not and alidate input
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    }
    type = req.body.type;
    data = req.body.data;

    console.log("data.draftID: ", data.draftID);
    console.log("req.session.draftID: ", req.session.draftID);
    if (Array.isArray(data.steps)) {
        data.steps = data.steps.map(step => {
            return Object.fromEntries(Object.entries(step).filter(([key, value]) => key !== "id"));
        });
    }
    // Filter out 'id' key from each object in the ingredients array
    if (Array.isArray(data.ingredients)) {
        data.ingredients = data.ingredients.map(ingredient => {
            return Object.fromEntries(Object.entries(ingredient).filter(([key, value]) => key !== "id"));
        });
    }

    if (!data.draftID) {
        res.json({ message: 'Draft update failed.' });
    } else {
        draftID = data.draftID != -1 ? data.draftID : req.session.draftID;
        data = Object.fromEntries(Object.entries(data).filter(([key, value]) => value !== " " && key !== "draftID"));

        console.log('Action: update recpie draft, recipeID: >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

        connection.query('SELECT 1 FROM draft WHERE draftID = ? AND userID = (SELECT userID FROM user WHERE userName = ?)',
            [draftID, req.session.userName], function (error, results, fields) {
                if (error) throw error;
                if (results.length === 0) {

                } else {
                    connection.execute(
                        'UPDATE draft SET data = ? WHERE draftID = ?',
                        [
                            data,
                            draftID
                        ],
                        function (error) {
                            // console.log("error: ", error);
                            // console.log("results: ", results);
                            if (error) {
                                console.error('Error updating draft:', error);
                                return res.status(500).json({ message: 'Server error' });
                            } else {
                                req.session.draftID = draftID; // Set the session value here
                                console.log("req.session.draftID after update: ", req.session.draftID);
                                req.session.save(function (err) {
                                    if (err) {
                                        console.error('Session save error:', err);
                                        return res.status(500).json({ message: 'Server error' });
                                    }
                                    console.log("Session saved successfully.");
                                    res.json({ message: 'Draft updated successfully.', draftID: req.session.draftID });
                                });
                            }
                        }
                    );
                }
            });
    }
});

//-----------------------------------------------------------------------------------------
router.delete('/deleteDraft', (req, res) => {
    console.log('Action: Delete draft ---------------------------------------------------------------------');
    // Validate input
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    }
    if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
        return res.json({ message: 'No draft selected.' });
    }

    console.log('req.body: ', req.body);

    // UserId is required because it can advoid user delete other user's draft when they modify draftID in client.
    const draftIDs = Object.values(req.body);

    // Convert the array of draft IDs into a comma-separated string
    const draftIDsString = draftIDs.join(',');

    // Execute the SQL query
    connection.execute(
        `DELETE FROM draft WHERE draftID IN (${draftIDsString}) AND userID = (SELECT userID FROM user WHERE userName = ?)`,
        [req.session.userName],
        function (error, results, fields) {
            if (error) throw error;
            if (results.affectedRows === 0) {
                return res.json({ message: 'No draft found.' });
            } else {
                res.send("Re-render");
            }
        }
    );
});

module.exports = router;
