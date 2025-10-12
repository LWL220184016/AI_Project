import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_BASE_URL;

const recipesStore = createSlice({
    name: 'recipes',
    initialState: {
        recipesList: []
    },
    reducers: {
        setRecipesList(state, action) {
            state.recipesList = action.payload;
        }
    }
});

const { setRecipesList } = recipesStore.actions;
const fetchRecipesList = () => {
    return async (dispatch) => {
        axios.get(`${apiUrl}/api/recipes?checkUser=f`)
            .then(response => {
                // console.log(response.data);
                const data = response.data.map(item => {
                    if (item.date) {
                        // Convert date to ISO string
                        item.date = new Date(item.date).toString();
                    }
                    return item;
                });
                dispatch(setRecipesList(data));
            })
            .catch(error => {
                console.log(error);
            });
    }
}

const fetchUserRecipesList = () => {
    return async (dispatch) => {
        axios.get(`${apiUrl}/api/recipes?checkUser=t`, { withCredentials: true })
            .then(response => {
                // console.log(response.data);
                const data = response.data.map(item => {
                    if (item.date) {
                        // Convert date to ISO string
                        item.date = new Date(item.date).toString();
                    }
                    return item;
                });
                dispatch(setRecipesList(data));
            })
            .catch(error => {
                console.log(error);
            });
    }
}

export { fetchRecipesList, fetchUserRecipesList };

const reducer = recipesStore.reducer;
export default reducer;
