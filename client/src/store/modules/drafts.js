import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_BASE_URL;

const draftsStore = createSlice({
	name: 'drafts',
	initialState: {
		draftsList: []
	},
	reducers: {
		setDraftsList(state, action) {
			state.draftsList = action.payload;
		}
	}
});

const { setDraftsList } = draftsStore.actions;
const fetchDraftsList = () => {
	return async (dispatch) => {
		try {
			const response = await axios({
				method: 'get',
				url: `${apiUrl}/api/getRecipeDraftsList`,
				withCredentials: true,
				headers: {
					'Content-Type': 'application/json',
				},
			});
			dispatch(setDraftsList(response.data.results));

		} catch (error) {
			console.error('There has been a problem with your fetch operation: ', error);
		}
	}
}

export { fetchDraftsList };

const reducer = draftsStore.reducer;
export default reducer;
