import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_BASE_URL;

const recipeStore = createSlice({
    name: 'recipe',
    initialState: {
        recipeDetails: [],
        weight_unit: [],
        state: "",
    },
    reducers: {
        setRecipeDetails(state, action) {
            return { ...state, recipeDetails: action.payload };
        },
        setWeightUnit(state, action) {
            state.weight_unit = action.payload;
        },
        setRecipeAction(state, action) {
            state.state = action.payload;
        }
    }
});
const { setRecipeDetails, setWeightUnit, setRecipeAction } = recipeStore.actions;

const fetchRecipeDetails = (id) => {
    return async (dispatch) => {
        // console.log('id = ' + id);
        axios.get(`${apiUrl}/api/recipes/` + id)
            .then(response => {
                console.log(response.data);
                const data = response.data;
                if (data.date) {
                    // Convert date to ISO string
                    data.date = new Date(data.date).toString();
                }
                dispatch(setRecipeDetails(data));
            })
            .catch(error => {
                console.log(error);
            });
    }
}

const fetchRecipeDetails2 = (id) => {// for edit recipe
    return async (dispatch) => {
        // console.log('id = ' + id);
        try {
            const response = await axios({
                method: 'get',
                url: `${apiUrl}/api/updateRecipe/` + id,
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log("response.data: " + response.data);
            dispatch(setRecipeDetails(response.data));
        } catch (error) {
            console.log(error);
        }
    }
}

const fetchWeightUnitOption = () => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${apiUrl}/api/weightUnitOption/get_weight_unit_options`);
            // console.log(response.data);
            dispatch(setWeightUnit(response.data.results));
        } catch (error) {
            console.error("Error fetching weight unit options:", error);
        }
    }
}

const createRecipe = (recipe, imageName) => {
    return async (dispatch) => {
        console.log(recipe);
        console.log(imageName);
        if (!recipe.recipeTitle) {
            alert('Recipe title could not be empty!');
            return;
        } else if (!recipe.recipeType) {
            alert('Recipe type could not be empty!');
            return;
        } else if (!recipe.description) {
            alert('Description could not be empty!');
            return;
        } else if (!recipe.difflvl) {
            alert('Difficulty level could not be empty!');
            return;
        }
        // checkAttributesInput(recipe.ingredients, "ingredientName");
        // checkAttributesInput(recipe.steps.map(step => step.content), "step");

        try {
            const response = await axios({
                method: 'post',
                url: `${apiUrl}/api/releaseRecpie`,
                data: { recipe, imageName },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            const data = response.data;
            console.log(data);
            dispatch(setRecipeAction(data.message));
        } catch (error) {
            console.error('There has been a problem with your fetch operation: ', error);
        }
    }
}

const updateRecipe = (recipe, imageName) => {
    return async (dispatch) => {
        console.log(recipe);
        console.log(imageName);

        if (!recipe.recipeTitle) {
            alert('Recipe title could not be empty!');
            return;
        } else if (!recipe.recipeType) {
            alert('Recipe type could not be empty!');
            return;
        } else if (!recipe.description) {
            alert('Description could not be empty!');
            return;
        } else if (!recipe.difflvl) {
            alert('Difficulty level could not be empty!');
            return;
        }

        // Remove the images attribute from the recipe object
        const { images, ...recipeWithoutImages } = recipe;

        try {
            const response = await axios({
                method: 'put',
                url: `${apiUrl}/api/updateRecipe`,
                data: { recipe: recipeWithoutImages, imageName },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            const data = response.data;
            console.log(data);
            dispatch(setRecipeAction(data.message));
        } catch (error) {
            console.error('There has been a problem with your fetch operation: ', error);
        }
    }
}

const deleteRecipe = (recipeIDs) => {
    return async (dispatch) => {
        console.log("recipeIDs: " + recipeIDs);
        if (recipeIDs.length === 0) {
            alert('Please select recipes to delete!');
            return;
        }
        // checkAttributesInput(recipe.ingredients, "ingredientName");
        // checkAttributesInput(recipe.steps.map(step => step.content), "step");

        try {
            const response = await axios({
                method: 'delete',
                url: `${apiUrl}/api/deleteRecipes`,
                data: { recipeIDs },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            const data = response.data;
            console.log(data);
            dispatch(setRecipeAction(data.message));
        } catch (error) {
            console.error('There has been a problem with your fetch operation: ', error);
        }
    }
}

export { 
    fetchRecipeDetails, 
    fetchRecipeDetails2, 
    fetchWeightUnitOption, 
    createRecipe, 
    updateRecipe, 
    deleteRecipe 
};

const reducer = recipeStore.reducer;
export default reducer;
