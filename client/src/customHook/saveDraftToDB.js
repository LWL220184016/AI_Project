import { useCallback } from 'react';
import axios from 'axios';

const useSaveDraftToDB = () => {

    const saveDraftToDB = useCallback(async (data) => {
        if (!data) {
            return;
        }

        console.log(data);

        const apiUrl = process.env.REACT_APP_API_BASE_URL;
        let type = "recipe";

        try {
            const response = await axios({
                method: 'post',
                url: `${apiUrl}/api/saveDraft`,
                data: { type, data },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            const responseData = response.data;
            console.log("Save draft response:" + responseData.message);
            return responseData.message;
        } catch (error) {
            console.error('There has been a problem with your fetch operation: ', error);
        }
    }, []);

    const updateDraftToDB = useCallback(async (draftID, data) => {
        // when draftID = -1, !draftID is false and send request
        // when draftID = 0, !draftID is true and return
        // when draftID > 0, !draftID is false and send request
        if (!data || !draftID) { // when !data or !draftID is true, return and stop sending request
            return;
        }

        console.log(data);

        const apiUrl = process.env.REACT_APP_API_BASE_URL;
        let type = "recipe";

        try {
            const response = await axios({
                method: 'put',
                url: `${apiUrl}/api/saveDraft`,
                data: { type, data },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            const responseData = response.data;
            console.log("Save draft response:" + responseData);

            if (responseData.message) {
                // Handle other messages if needed
            }
        } catch (error) {
            console.error('There has been a problem with your fetch operation: ', error);
        }
    }, []);

    const deleteDraftsFromDB = useCallback(async (draftIDs) => {
        if (!draftIDs) { // when !data or !draftID is true, return and stop sending request
            return;
        }
        const confirmDelete = window.confirm('Are you sure you want to delete the selected drafts?');
        if (!confirmDelete) {
            return; // Exit if the user cancels the deletion
        }

        console.log(draftIDs);

        const apiUrl = process.env.REACT_APP_API_BASE_URL;

        try {
            const response = await axios({
                method: 'delete',
                url: `${apiUrl}/api/deleteDraft`,
                data: { draftIDs },
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
    }, []);

    return { saveDraftToDB, updateDraftToDB, deleteDraftsFromDB };
};

export default useSaveDraftToDB;