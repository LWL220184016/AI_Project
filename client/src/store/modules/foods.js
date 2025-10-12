import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_BASE_URL;

const foodsStore = createSlice({
	name: 'foods',
	initialState: {
		foodsList: []
	},
	reducers: {
		setFoodsList(state, action) {
			state.foodsList = action.payload;
		}
	}
});

const { setFoodsList } = foodsStore.actions;
const fetchFoodsList = () => {
	return async (dispatch) => {
		axios.get(`${apiUrl}/api/foods`)
		    .then(response => {
				console.log(response);
		        dispatch(setFoodsList(response.data));
		    })
		    .catch(error => {
		        console.log(error);
		    });
	}
}

export { fetchFoodsList };

const reducer = foodsStore.reducer;
export default reducer;
