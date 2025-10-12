const express = require('express');
const router = express.Router();
const session = require('../sessionHandler.js');
const connection = require('../connectionHandler.js');

require('dotenv').config();

router.use(express.json());
router.use(session);

// Recipe
//-----------------------------------------------------------------------------------------
router.get('/getRecipeCommentsList/:id', (req, res) => {
    console.log('Action: Geting recipe comments list ---------------------------------------------------------------------');
    // Validate input
    const id = parseInt(req.params.id, 10);
    console.log('ID: ', id);

    connection.query(`
                SELECT comment.commentID, user.userName, comment.rating, comment.comment, comment.createTime
                FROM comment
                INNER JOIN user ON comment.userID = user.userID
                WHERE comment.recipeID = ?`,
        [id],
        function (error, results, fields) {
            if (error) throw error;
            if (results.length === 0) {
                return res.json({ message: 'No comment found.' });
            } else {
                res.json(results);
            }
        });
});

// -----------------------------------------------------------------------------------------
router.post('/saveRecipeComment', (req, res) => {
    console.log('Action: comment upload request ---------------------------------------------------------------------');
    console.log("Session ID when created:", req.sessionID);
    console.log("req.body: ", req.body);

    // Check user is login or not and alidate input
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    }
    var comment = req.body.data;
    let rating = null;

    if (undefined !== comment.rating) {
        rating = Number(comment.rating);
        if (isNaN(rating) || rating < 0 || rating > 5) {
            return res.json({ message: 'Rating must be a number between 0 and 5.' });
        }
    }

    // if it is a number, it will return false, otherwise it will return true.

    console.log("recipeID: ", comment.recipeID);
    if (comment.recipeID) {
        console.log('Action: inserting new recpie comment, recipeID: >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

        if (!comment.comment) {
            comment.comment = '';
        }
        connection.execute(
            'INSERT INTO comment (recipeID, userID, rating, comment) VALUES (?, (SELECT userID FROM user WHERE userName = ?), ?, ?)',
            [
                comment.recipeID,
                req.session.userName,
                rating,
                comment.comment
            ],
            function (error, results) {
                // console.log("error: ", error);
                // console.log("results: ", results);
                if (error || results.affectedRows === 0) {
                    console.error('Error inserting comment:', error);
                    return res.status(500).json({ message: 'Server error' });
                }
                update_recipe_rating(comment.recipeID);
                return res.json({ message: 'Comment created successfully.' });
            }
        );

    } else {
        return res.json({ message: 'Comment create failed.' });
    }
});

// -----------------------------------------------------------------------------------------
router.put('/saveRecipeComment', (req, res) => {
    console.log('Action: comment update request ---------------------------------------------------------------------');
    console.log("Session ID when created:", req.sessionID);
    console.log("req.body: ", req.body);

    // Check user is login or not and validate input
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    }

    let data = req.body.data;
    let rating = null;

    if (isNaN(Number(data.rating)) || data.rating === '' || data.rating === null) {
        rating = null;
    } else {
        rating = Number(data.rating);
        if (rating < 0 || rating > 5) {
            return res.json({ message: 'Rating must be a number between 0 and 5.' });
        }
    }
    console.log("data.commentID: ", data.commentID);

    if (!data.commentID) {
        return res.json({ message: 'Comment update failed.' });
    } else {
        let commentID = data.commentID != -1 ? data.commentID : req.session.commentID;

        // Fixed SQL query - FROM comes before JOIN
        connection.query('SELECT comment.recipeID FROM comment ' +
            'WHERE comment.commentID = ? AND comment.userID = (SELECT userID FROM user WHERE userName = ?)',
            [commentID, req.session.userName], function (error, results, fields) {
                if (error) {
                    console.error('Error fetching comment data:', error);
                    return res.status(500).json({ message: 'Server error' });
                }

                if (results.length === 0) {
                    return res.json({ message: 'No comment found.' });
                }

                const recipeID = results[0].recipeID;
                console.log('Comment exists, updating comment >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

                // Update the comment
                connection.execute(
                    'UPDATE comment SET rating = ?, comment = ? WHERE commentID = ?',
                    [rating, data.comment, commentID],
                    function (error, updateResults) {
                        if (error) {
                            console.error('Error updating comment:', error);
                            return res.status(500).json({ message: 'Server error' });
                        }

                        if (updateResults.affectedRows === 1) {
                            console.log('Comment updated successfully.', commentID);
                            update_recipe_rating(recipeID);
                        } else {
                            console.log('Comment update failed.');
                            return res.json({ message: 'Comment update failed.' });
                        }
                    }
                );
            }
        );
    }
});

//-----------------------------------------------------------------------------------------
router.delete('/deleteRecipeComment', (req, res) => {
    console.log('Action: Delete comment ---------------------------------------------------------------------');
    // Validate input
    if (!req.session.userName) {
        return res.json({ message: 'Please login.' }); // User not login.
    }
    if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
        return res.json({ message: 'No comment selected.' });
    }

    console.log('req.body: ', req.body);

    // UserId is required because it can advoid user delete other user's comment when they modify commentID in client.
    const commentID = req.body.commentID;
    let recipeID = null;
    connection.query(
        'SELECT recipeID FROM comment WHERE commentID = ?',
        [commentID],
        function (error, results, fields) {
            if (error) throw error;
            if (results.length === 0) {
                return res.json({ message: 'No comment found.' });
            }
            // Update the recipe rating
            recipeID = results[0].recipeID;
        }
    );
    // Execute the SQL query
    connection.execute(
        `DELETE FROM comment WHERE commentID = ? AND userID = (SELECT userID FROM user WHERE userName = ?)`,
        [commentID, req.session.userName],
        function (error, results, fields) {
            if (error) throw error;
            if (results.affectedRows === 0) {
                return res.json({ message: 'No comment found.' });
            } else {
                update_recipe_rating(recipeID);
                res.send("Comment deleted successfully.");
            }
        }
    );
});



const update_recipe_rating = (recipeID) => {
    connection.query('SELECT rating FROM comment WHERE recipeID = ?',
        [recipeID], function (error, results, fields) {
            if (error) {
                console.error('Error fetching comment data:', error);
            }
            let rating = 0;
            for (res in results) {
                rating += results[res].rating;
            }
            // Update the recipe rating
            // 評分會在客戶端除以總評論數
            console.log('New recipe rating: ', rating);
            connection.execute(
                'UPDATE recipe SET rating = ? WHERE recipeID = ?',
                [rating, recipeID],
                function (error, ratingResults) {
                    if (error) {
                        console.error('Error updating recipe rating:', error);
                        // Still return success for the comment update
                    }
                }
            );
        });
}

module.exports = router;
