import { useCallback } from 'react';
import axios from 'axios';

const useCommentHandler = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const fetchCommentsFromDB = useCallback(async (recipeID) => {
        if (!recipeID) {
            return;
        }


        try {
            const response = await axios({
                method: 'get',
                url: `${apiUrl}/api/getRecipeCommentsList/${recipeID}`, 
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            const responseData = response.data;
            // console.log("response: " + JSON.stringify(response, null, 2));
            // console.log("response.data: " + JSON.stringify(response.data, null, 2));

            return responseData;
        } catch (error) {
            console.error('There has been a problem with your fetch operation: ', error);
        }
    }, [apiUrl]);

    const saveCommentToDB = useCallback(async (data) => {
        if (!data) {
            return;
        }

        if (!data.rating){
            alert("Please rate the recipe before submitting your comment.");
            return;
        }

        try {
            const response = await axios({
                method: 'post',
                url: `${apiUrl}/api/saveRecipeComment`,
                data: { data },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            const responseData = response.data;
            console.log("Save comment response:" + responseData.message);
            return responseData.message;
        } catch (error) {
            console.error('There has been a problem with your fetch operation: ', error);
        }
    }, [apiUrl]);

    const updateCommentToDB = useCallback(async (data) => {
        if (!data || !data.commentID) {
            console.log("commentID: " + data.commentID + ", data: " + JSON.stringify(data));
            return;
        }
        console.log(data);

        try {
            const response = await axios({
                method: 'put',
                url: `${apiUrl}/api/saveRecipeComment`,
                data: { data },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            const responseData = response.data.message;
            console.log("Save comment response:" + responseData);

            if (responseData) {
                // Handle other messages if needed
                return responseData;
            }
        } catch (error) {
            console.error('There has been a problem with your fetch operation: ', error);
        }
    }, [apiUrl]);

    const deleteCommentFromDB = useCallback(async (commentID) => {
        if (!commentID) { // when !data or !commentID is true, return and stop sending request
            return "No commentID to delete.";
        }
        const confirmDelete = window.confirm('Are you sure you want to delete the selected comments?');
        if (!confirmDelete) {
            return; // Exit if the user cancels the deletion
        }

        try {
            const response = await axios({
                method: 'delete',
                url: `${apiUrl}/api/deleteRecipeComment`,
                data: { commentID },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            const responseData = response.data;
            console.log(responseData);

            return responseData;
        } catch (error) {
            console.error('There has been a problem with your fetch operation: ', error);
        }
    }, [apiUrl]);

    return { fetchCommentsFromDB, saveCommentToDB, updateCommentToDB, deleteCommentFromDB };
};

export default useCommentHandler;