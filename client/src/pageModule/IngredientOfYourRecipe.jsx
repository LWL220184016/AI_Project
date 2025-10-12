import React from 'react';
import './IngredientOfYourRecipe.css'; // Import the scoped CSS
import EditableList from './editableList'; // Reusable list component

function IngredientOfYourRecipe({ ingredients, updateIngredients, goToPreviousStep }) {
    const handleAddIngredient = () => {
        // Add a new blank ingredient to the ingredients list
        const newIngredient = { ingredientName: '', weight: '', unit: '' };
        updateIngredients([...ingredients, newIngredient]);
    };

    const handleRemoveIngredient = (index) => {
        // Remove the ingredient at the specified index
        const updatedIngredients = ingredients.filter((_, i) => i !== index);
        updateIngredients(updatedIngredients);
    };

    return (
        <div className="step-container">
            <h2>Ingredient of Your Recipe</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Weight</th>
                        <th>Unit</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {ingredients.map((ingredient, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Ingredient Name"
                                    value={ingredient.ingredientName}
                                    onChange={(e) =>
                                        updateIngredients(
                                            ingredients.map((item, i) =>
                                                i === index
                                                    ? { ...item, ingredientName: e.target.value }
                                                    : item
                                            )
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    placeholder="Weight"
                                    value={ingredient.weight}
                                    onChange={(e) =>
                                        updateIngredients(
                                            ingredients.map((item, i) =>
                                                i === index ? { ...item, weight: e.target.value } : item
                                            )
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Unit (e.g., grams, cups)"
                                    value={ingredient.unit}
                                    onChange={(e) =>
                                        updateIngredients(
                                            ingredients.map((item, i) =>
                                                i === index ? { ...item, unit: e.target.value } : item
                                            )
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <button
                                    className="ingredient-button ingredient-remove-button"
                                    onClick={() => handleRemoveIngredient(index)}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                className="ingredient-button ingredient-add-button"
                onClick={handleAddIngredient}
            > 
                Add Ingredient
            </button>&nbsp;
            <button className="ingredient-button previous" onClick={goToPreviousStep}>
                Previous
            </button>&nbsp;
        </div>
    );
}

export default IngredientOfYourRecipe;