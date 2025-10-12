import draftsReducer from './modules/drafts';
import draftDetailsReducer from './modules/draft_details';
import recipesReducer from './modules/recpies';
import recipeDetailsReducer from './modules/recipe_details';
import foodsReducer from './modules/foods';
import foodDetailsReducer from './modules/food_details';
import userReducer from './modules/user';
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
    reducer: {
        drafts: draftsReducer,
        draft: draftDetailsReducer,
        recipes: recipesReducer,
        recipe: recipeDetailsReducer,
        foods: foodsReducer,
        food: foodDetailsReducer,
        user: userReducer,
    }
})

export default store;
