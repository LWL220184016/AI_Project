import React from 'react';
import './ReleaseYourRecipe.css'; // Specific styles for Step 1 (optional)

function ReleaseYourRecipe({ formData, handleChange, goToNextStep }) {
    return (
        <div className="step-container">
            <h2>Release Your Recipe</h2>
            <div>
                <label>Recipe Title:</label>
                <input
                    type="text"
                    name="recipeTitle"
                    placeholder="Enter Recipe Title"
                    value={formData.recipeTitle}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Recipe Type:</label>
                <input
                    type="text"
                    name="recipeType"
                    placeholder="Enter Recipe Type"
                    value={formData.recipeType}
                    onChange={handleChange}
                    required
                />
            </div> 
            <div>
                <label>Description:</label> 
                <textarea
                    name="description"
                    placeholder="Enter Recipe Description"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Serving size:</label>
                <input
                    type="number"
                    name="servingSize"
                    value={formData.servingSize}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Prepare time(Minute):</label>
                <input
                    type="number"
                    name="prepareTime"
                    value={formData.prepareTime}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Cook time(Minute):</label>
                <input
                    type="number"
                    name="cookTime"
                    value={formData.cookTime}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Difficulty level:</label>
                <select name="difflvl" id="difflvl" onChange={handleChange} >
                    <option value="">Select</option>
                    <option value="1">1 (eazy)</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5 (hard)</option>
                </select>
            </div>
            <button onClick={goToNextStep}>Next</button>
        </div>
    );
}

export default ReleaseYourRecipe;