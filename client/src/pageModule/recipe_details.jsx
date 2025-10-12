import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipeDetails } from '../store/modules/recipe_details';
import { BiLike, BiDislike } from "react-icons/bi";
import { fetchFoodDetails } from '../store/modules/food_details';
import { v4 as uuidv4 } from 'uuid';
import useCommentHandler from '../customHook/comment';
import { checkUserLogin } from '../store/modules/user';
import './recipe_details.css'; // Import a CSS file for styling

function RecipeDetails({ id }) {
    const [state, setState] = useState('');
    const { fetchCommentsFromDB, saveCommentToDB, updateCommentToDB, deleteCommentFromDB } = useCommentHandler();
    const [foodName, setFoodName] = useState(0);
    const [isSaveDraft, setIsSaveDraft] = useState(0);
    const [divKey, setDivKey] = useState(uuidv4());
    const [comment, setComment] = useState({ recipeID: id });
    const [comments, setComments] = useState([]); // show comment throw error
    const [commentDivKey, setCommentDivKey] = useState(uuidv4());

    const checkUser = useSelector(state => state.user.userName);

    const [editingComment, setEditingComment] = useState({ commentID: '', rating: '', comment: '' });
    const dispatch = useDispatch();


    useEffect(() => {
        console.log("update comment: ", JSON.stringify(editingComment));
    }, [editingComment]);


    const fetchComments = async () => {
        const data = await fetchCommentsFromDB(id);
        if (Array.isArray(data)) {
            setComments(data);
        } else {
            setState(data.message);
            setComments([]);
        }
    };

    useEffect(() => {
        dispatch(fetchRecipeDetails(id))
        fetchComments();
    }, [dispatch, id]);
    const recipeDetails = useSelector(state => state.recipe.recipeDetails);

    const iconStyle = { color: "Purple", fontSize: "1.5em" }

    useEffect(() => {
        if (foodName) {
            console.log("foodName: " + foodName);
            dispatch(fetchFoodDetails(foodName));
        }
    }, [foodName])
    const foodDetails = useSelector(state => state.food.foodDetails);
    useEffect(() => {
        setDivKey(uuidv4());
    }, [foodDetails, foodName])

    const handleFormValue_Comment = useCallback((e) => {
        const { name, value } = e.target;
        console.log("name: " + name + ", value: " + value);

        var updatedComment = {};
        setComment((prevComment) => {
            console.log("prevComment: ", JSON.stringify(prevComment, null, 2)); // Log the object as JSON

            // if rating < 0, same with previous value or cannot convert to number return previous comment
            // if rating > 5, set it to 5
            if (prevComment[name] === value) return prevComment; // 避免不必要的状态更新
            if (name === "rating" && value < 0) {
                updatedComment = { ...prevComment, [name]: 0 };
                document.getElementById("rating").value = 0;

            } else if (name === "rating" && value > 5) {
                updatedComment = { ...prevComment, [name]: 5 };
                document.getElementById("rating").value = 5;

            } else if (name === "rating" && value === '') {
                // No action here, but it should be existed to avoid the following
                // checking because it is not a number

            } else if (name === "rating" && !Number(value)) {
                if (!prevComment.rating) {
                    document.getElementById("rating").value = "";
                } else {
                    document.getElementById("rating").value = prevComment.rating;
                }
                return prevComment;
            } else {
                updatedComment = { ...prevComment, [name]: value };
            }
            // setIsSaveDraft(isSaveDraft + 1);
            // console.log("Comment: ", JSON.stringify(updatedComment, null, 2)); // Log the object as JSON
            return updatedComment;
        });
    }, [isSaveDraft]);

    const handleNumberInput = (e) => {
        const value = e.target.value;
        e.target.value = value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
    };

    const handleSubmitComment = useCallback(async (e) => {
        e.preventDefault();
        try {
            const msg = await saveCommentToDB(comment); // Await the promise
            console.log(msg);
            setState(msg);
            if (msg === 'Comment created successfully.') {
                fetchComments(id); // Await the promise
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    }, [comment, saveCommentToDB, id]);
    useEffect(() => {
        setCommentDivKey(uuidv4());
    }, [comments]);

    const showUpdateComment = (comment) => {
        setEditingComment({ commentID: comment.commentID, rating: comment.rating, comment: comment.comment });
    };
    const cancelUpdateComment = () => {
        setEditingComment({ commentID: '', rating: '', comment: '' });
    };

    const handleUpdateComment = useCallback(async () => {
        console.log("Update comment: ", JSON.stringify(editingComment)); // Log the object as JSON
        try {
            const msg = await updateCommentToDB(editingComment); // Await the promise
            console.log(msg);
            setState(msg);
            if (msg === 'Comment updated successfully.') {
                fetchComments(id); // Await the promise
                cancelUpdateComment();
            }
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    }, [editingComment, editingComment.commentID, updateCommentToDB, id]);

    const handleDeleteComment = useCallback(async (commentID) => {
        console.log("Delete comment: ", JSON.stringify(commentID)); // Log the object as JSON
        try {
            const msg = await deleteCommentFromDB(commentID); // Await the promise
            console.log(msg);
            setState(msg);
            if (msg === 'Comment deleted successfully.') {
                fetchComments(id); // Await the promise
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    }, []);
    return (
        <div className='container'>
            <h1>Recipe details</h1>
            <div className="recipe-details-container">
                <div className="recipe-info">
                    {recipeDetails ? (
                        <div key={recipeDetails.id}>
                            <h2>Name: {recipeDetails.name}</h2>
                            <p><strong>Recipe Type:</strong> {recipeDetails.recipeType}</p>
                            <p><strong>Description:</strong> {recipeDetails.description}</p>
                            <div>
                                <h3>Steps:</h3>
                                {recipeDetails.steps ? (
                                    recipeDetails.steps.map(step => (
                                        <p key={step.seqID}>{step.content}</p>
                                    ))
                                ) : (
                                    <p>No steps yet!</p>
                                )}
                            </div>
                            <p><strong>Rating:</strong> {recipeDetails.rating === '0' ? 'No rating' : recipeDetails.rating}</p>
                            <p><strong>Author:</strong> {recipeDetails.author}</p>
                            <p><strong>Difficulty Level:</strong> {recipeDetails.difficultyLevel}</p>
                            <p><strong>Date:</strong> {recipeDetails.date}</p>
                        </div>
                    ) : (
                        <div>Data not found!</div>
                    )}
                </div>
                <div className="recipe-ingredients">
                    <h3>Ingredients:</h3>
                    {recipeDetails.ingredients ? (
                        recipeDetails.ingredients.map(ingredient => (
                            <div key={ingredient.name} className="ingredient-item">
                                <p><strong>{ingredient.name}</strong></p>
                                <p>Weight: {ingredient.weight_KG} {ingredient.unitName}</p>
                                <button onClick={() => setFoodName(ingredient.name)}>Details</button>
                            </div>
                        ))
                    ) : (
                        <p>No ingredients yet!</p>
                    )}
                    {foodDetails && foodDetails.length > 0 && foodName ? (
                        <div className="food-details">
                            <h3>Food Details for: {foodName}</h3>
                            <p>Carbohydrates: {foodDetails[0].Carbohydrates}</p>
                            <p>Proteins: {foodDetails[0].Proteins}</p>
                            <p>Fats: {foodDetails[0].Fats}</p>
                            <p>Vitamins: {foodDetails[0].Vitamins}</p>
                            <p>Minerals: {foodDetails[0].Minerals}</p>
                            <p>Water: {foodDetails[0].Water}</p>
                        </div>
                    ) : (
                        foodName !== 0 && <p>Food details not found!</p>
                    )}
                </div>
            </div>
            <div className="recipe-images">
                <h3>Images:</h3>
                {recipeDetails && recipeDetails.images ? (
                    recipeDetails.images.map((image, index) => (
                        <img key={index} src={`data:image/png;base64,${image}`} alt='Recipe' className="recipe-image" />
                    ))
                ) : (
                    <p>No images yet!</p>
                )}
            </div>
            {recipeDetails ? (
                <div key={recipeDetails.id}>
                    {checkUser ? (
                        <form>
                            <h3>{state}</h3>
                            <label htmlFor='rating'>Rating (min: 1, max: 5): </label>
                            <input type="number" min={1} max={5} name='rating' id='rating' onChange={handleFormValue_Comment} onInput={handleNumberInput} />
                            <br />
                            <label htmlFor='comment'>Comment: </label>
                            <input type="text" name='comment' id='comment' onChange={handleFormValue_Comment} placeholder="Enter your comment" />
                            <button name='submitComment' onClick={handleSubmitComment}>Submit</button>
                        </form>
                    ) : (
                        <p>You must login before comment</p>
                    )}

                    <b key={"commentB"}>User comments:</b>
                    <div key={commentDivKey}>
                        {comments ? (
                            comments.map(comment => (
                                // console.log("comment: ", JSON.stringify(comment)),
                                <div key={comment.commentID}>
                                    {editingComment.commentID === comment.commentID ? (
                                        <>
                                            <p>Rating:</p>
                                            <input
                                                type="number"
                                                min={0}
                                                max={5}
                                                name="rating"
                                                value={editingComment.rating || ''}
                                                onChange={(e) => setEditingComment({ ...editingComment, rating: e.target.value })}
                                                onInput={handleNumberInput}
                                            />
                                            <p>Comment:</p>
                                            <input
                                                type="text"
                                                name="comment"
                                                value={editingComment.comment || ''}
                                                onChange={(e) => setEditingComment({ ...editingComment, comment: e.target.value })}
                                                placeholder="Enter your comment"
                                            />
                                            <button onClick={cancelUpdateComment}>Cancel</button>
                                            <button onClick={handleUpdateComment}>Submit</button>
                                        </>
                                    ) : (
                                        <>
                                            <p>User: {comment.userName}</p>
                                            <p>Rating: {comment.rating}</p>
                                            <p>Comment: {comment.comment}</p>
                                            <p>date: {comment.createTime}</p>

                                            {checkUser ? (
                                                <>
                                                    {checkUser === comment.userName ? (
                                                        <>
                                                            <button onClick={() => showUpdateComment(comment)}>Update</button>
                                                            <button onClick={() => handleDeleteComment(comment.commentID)}>Delete</button>
                                                        </>
                                                    ) : null}
                                                    <button><BiLike style={iconStyle} /></button>
                                                    <button><BiDislike /></button>
                                                </>
                                            ) : (
                                                <p>You must login before like or dislike</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div>No comments yet!</div>
                        )}
                    </div>
                </div>
            ) : (
                <div>Data not found!</div>
            )}
        </div>
    )
}

export default RecipeDetails;