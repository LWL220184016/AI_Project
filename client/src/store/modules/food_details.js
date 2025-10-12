import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_BASE_URL;

const foodStore = createSlice({
	name: 'food',
	initialState: {
		foodDetails: []
	},
	reducers: {
		setFoodDetails(state, action) {
			state.foodDetails = action.payload;
		}
	}
});

const { setFoodDetails } = foodStore.actions;
const fetchFoodDetails = (name) => {
	console.log('name = ' + name);
	return async (dispatch) => {
		try {
			const response = await axios({
				method: 'get',
				url: `${apiUrl}/api/foods/${name}`,
				headers: {
					'Content-Type': 'application/json',
				},
			});
			console.log("response.data: " + response.data);
			dispatch(setFoodDetails(response.data));
		} catch (error) {
			console.log(error);
		}
	}
}


export { fetchFoodDetails };

const reducer = foodStore.reducer;
export default reducer;
