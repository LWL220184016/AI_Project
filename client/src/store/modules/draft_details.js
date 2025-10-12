import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_BASE_URL;

const draftStore = createSlice({
	name: 'draft',
	initialState: {
		draftDetails: [],
		state: ""
	},
	reducers: {
		setDraftDetails(state, action) {
			state.draftDetails = action.payload;
		},
		createDraft(state, action) {
			state.state = action.payload;
		},
		updateDraft(state, action) {
			state.state = action.payload;
		},
		deleteDrafts(state, action) {
			state.state = action.payload;
		}
	}
});

const { setDraftDetails, createDraft, updateDraft, deleteDrafts } = draftStore.actions;
const fetchDraftDetails = (id) => {
	if (!id) {
		console.log('Please select a draft!');
		return;
	}

	return async (dispatch) => {
		try {
			const response = await axios({
				method: 'get',
				url: `${apiUrl}/api/getRecipeDraftData/` + id,
				withCredentials: true,
				headers: {
					'Content-Type': 'application/json',
				},
			});
			dispatch(setDraftDetails(response.data.results));

		} catch (error) {
			console.error('There has been a problem with your fetch operation: ', error);
		}
	}
}

const saveDraftToDB = (data) => {
	if (!data) {
		return;
	}
	console.log(data);
	let type = "recipe";

	return async (dispatch) => {
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
			dispatch(createDraft(responseData.message));
		} catch (error) {
			console.error('There has been a problem with your fetch operation: ', error);
		}
	}
};

const updateDraftToDB = (draftID, data) => {
	// when draftID = -1, !draftID is false and send request
	// when draftID = 0, !draftID is true and return
	// when draftID > 0, !draftID is false and send request
	if (!data || !draftID) { // when !data or !draftID is true, return and stop sending request
		return;
	}
	console.log(data);
	let type = "recipe";
	return async (dispatch) => {
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
			dispatch(updateDraft(responseData.message));
		} catch (error) {
			console.error('There has been a problem with your fetch operation: ', error);
		}
	}
}

const deleteDraftsFromDB = (draftIDs) => {
	if (!draftIDs) { // when !data or !draftID is true, return and stop sending request
		return;
	}
	const confirmDelete = window.confirm('Are you sure you want to delete the selected drafts?');
	if (!confirmDelete) {
		return; // Exit if the user cancels the deletion
	}
	console.log(draftIDs);

	return async (dispatch) => {
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

			dispatch(deleteDrafts(responseData.message));
		} catch (error) {
			console.error('There has been a problem with your fetch operation: ', error);
		}
	}
}

const resetDraftDetails = (id) => {
	return async (dispatch) => {
		dispatch(setDraftDetails([]));
	}
}

export { fetchDraftDetails, saveDraftToDB, updateDraftToDB, deleteDraftsFromDB, resetDraftDetails };

const reducer = draftStore.reducer;
export default reducer;
