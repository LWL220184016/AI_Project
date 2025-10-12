import "./scrollable-container.css";
import React, { useEffect, useState, useCallback } from 'react';
import UploadFile from './uploadFile';
import EditableList from './editableList';
// import useSaveDraftToDB from '../customHook/saveDraftToDB';
import { v4 as uuidv4 } from 'uuid';

import { useDispatch, useSelector } from 'react-redux';
import { fetchDraftsList } from '../store/modules/drafts';
import { resetDraftDetails } from '../store/modules/draft_details';
import { fetchWeightUnitOption, fetchRecipeDetails2, updateRecipe } from '../store/modules/recipe_details';

// if you want to import Header2 but not import Header1 in other file, use the following code:
// import { Header2 } from './header.jsx';

function EditRecipe(recipeID) {
    const [state, setState] = useState("");
    // const [timeoutId, setTimeoutId] = useState(null);
    const [isSaveDraft, setIsSaveDraft] = useState(0);
    const [recipe, setRecipe] = useState({});
    const [keyStep, setKeyStep] = useState(uuidv4());
    const [keyIngredient, setKeyIngredient] = useState(uuidv4());
    const [keyDraftTable, setKeyDraftTable] = useState(uuidv4());
    const [imageName, setImageName] = useState(""); // imageName here because release recipe needs to be uploaded it to database
    // const [isTableVisible, setIsTableVisible] = useState(false); // State to control table visibility
    // const { saveDraftToDB, updateDraftToDB, deleteDraftsFromDB } = useSaveDraftToDB();
    recipeID = recipeID.recipeID;

    const dispatch = useDispatch();
    useEffect(() => {
        console.log('recipeID:', recipeID);
        dispatch(fetchDraftsList());
        dispatch(fetchRecipeDetails2(recipeID));
        dispatch(fetchWeightUnitOption());
        console.log('imageName:', imageName);
    }, [dispatch])
    let { draftsList } = useSelector(state => state.drafts);
    const recipeDetails = useSelector(state => state.recipe.recipeDetails);
    const weight_unit = useSelector(state => state.recipe.weight_unit);
    const recipeState = useSelector(state => state.recipe.state);

    // useEffect(() => {
    //     console.log('draftsList:', draftsList);
    //     setKeyDraftTable(uuidv4());
    // }, [draftsList]);
    // 
    // useEffect(() => {
    //     if (timeoutId) {
    //         clearTimeout(timeoutId);
    //     }

    //     const newTimeoutId = setTimeout(() => {
    //         if (isSaveDraft > 0) {
    //             if (recipe.draftID === 0) {
    //                 saveDraftToDB(recipe).then((message) => { 
    //                     setState(message);
    //                     dispatch(fetchDraftsList());
    //                 });// fetchDraftsList must be called after saveDraftToDB response
    //                 setRecipe({
    //                     ...recipe,
    //                     draftID: -1
    //                 })
    //             } else {
    //                 updateDraftToDB(recipe.draftID, recipe);
    //             }
    //         }
    //     }, 100);
    //     setTimeoutId(newTimeoutId);
    //     return () => clearTimeout(newTimeoutId); // Cleanup timeout on component unmount
    // }, [isSaveDraft]);

    const handleFormValue_Recipe = useCallback((e) => {
        const { name, value } = e.target;
        setRecipe((prevRecipe) => {
            if (prevRecipe[name] === value) return prevRecipe; // 避免不必要的状态更新
            const updatedRecipe = { ...prevRecipe, [name]: value };
            setIsSaveDraft(isSaveDraft + 1);
            return updatedRecipe;
        });
    }, [isSaveDraft]);

    const updateIngredients = (ingredients) => {
        console.log('recipe:', recipe);

        setRecipe(prevState => {
            const updatedingredient = {
                ...prevState,
                ingredients
            };
            setIsSaveDraft(isSaveDraft + 1);
            return updatedingredient;
        });

        console.log('Updated Ingredients:', ingredients);
    };

    const updateSteps = (steps) => {
        console.log('recipe:', recipe);

        setRecipe(prevState => {
            const updatedStep = {
                ...prevState,
                steps
            };
            setIsSaveDraft(isSaveDraft + 1);
            return updatedStep;
        });
        console.log('Updated Steps:', steps);
    };

    const updateExistRecipe = () => {
        console.log(recipe);
        console.log(imageName);
        setState("Saving...");
        dispatch(updateRecipe(recipe, imageName));
    };
    useEffect(() => {
        console.log(recipeState);
        if (recipeState === "success") {
            setState("Recipe update successfully!");
            dispatch(resetDraftDetails());
            dispatch(fetchDraftsList());
        }
    }, [recipeState]);

    // Use to load recipe which user want to update, changed from the following commented code
    useEffect(() => {
        if (recipeDetails) {
            console.log('recipeDetails:', recipeDetails);

            const fields = ['recipeTitle', 'recipeType', 'description', 'servingSize', 'prepareTime', 'cookTime', 'difflvl'];
            fields.forEach(field => {
                document.getElementById(field).value = recipeDetails[field] || "";
            });

            // Create a shallow copy of recipeDetails
            const recipeCopy = { ...recipeDetails };

            // Ensure ingredients and steps are arrays
            if (!recipeCopy.ingredients) {
                recipeCopy.ingredients = [{ ingredientName: "", weight: "", unit: "" }];
            } else {
                recipeCopy.ingredients = recipeCopy.ingredients.map((ingredient, i) => {
                    return {
                        ...ingredient,
                        unit: ingredient.unit || "kilogram(kg)" // Set unit to "KG" if not already defined
                    };
                });
            }
            if (!recipeCopy.steps) {
                recipeCopy.steps = [{ content: "" }];
            }

            setRecipe(recipeCopy);
            setKeyStep(uuidv4()); // Update key to force re-render
            setKeyIngredient(uuidv4()); // Update key to force re-render
            setState(`Editing recipe ${recipeID}!`);
        }
    }, [recipeDetails]);
    // const loadDraft = (draftIndex) => {
    //     // Check if draftIndex is within the valid range
    //     if (draftIndex < 0 || draftIndex >= draftsList.length) {
    //         alert('Please select a draft!');
    //         return;
    //     }

    //     // Destructure the draft object
    //     const draft = draftsList[draftIndex];
    //     const draftID = draft.draftID;

    //     // Check if draftID is defined
    //     if (!draftID) {
    //         alert('Please select a draft!');
    //         return;
    //     }

    //     // Log the draftID for debugging purposes
    //     console.log('draftID:', draftID);

    //     // Dispatch the action to fetch draft details
    //     dispatch(fetchDraftDetails(draftID));
    // };
    // const draftDetails = useSelector(state => state.draft.draftDetails);
    // useEffect(() => {
    //     // console.log('draftDetails:', draftDetails);
    //     if (draftDetails[0]) {
    //         const draftDataCopy = { ...draftDetails[0]["data"], draftID: draftDetails[0].draftID };
    //         console.log('draftDetails:', draftDataCopy);

    //         const fields = ['recipeTitle', 'recipeType', 'description', 'servingSize', 'prepareTime', 'cookTime', 'difflvl'];
    //         fields.forEach(field => {
    //             document.getElementById(field).value = draftDataCopy[field] || "";
    //         });

    //         setRecipe(draftDataCopy);
    //         setKeyStep(uuidv4()); // Update key to force re-render
    //         setKeyIngredient(uuidv4()); // Update key to force re-render
    //         setState(`Loading draft ${draftDataCopy.draftID}!`);
    //     }
    // }, [draftDetails]);

    // const handleDeleteDraft = async () => {
    //     var draftIDs = [];
    //     for (let i = 0; i < draftsList.length; i++) {
    //         if (document.getElementById('select' + i).checked) {
    //             draftIDs.push(draftsList[i].draftID);
    //         }
    //     }
    //     if (draftIDs.length === 0) {
    //         alert('Please select drafts to delete!');
    //         return;
    //     }

    //     const result = await deleteDraftsFromDB(draftIDs);
    //     if (result) {
    //         try {
    //             if (result === "Re-render") {
    //                 dispatch(fetchDraftsList());
    //             }
    //         } catch (e) {
    //             setState(e.message);
    //         }
    //     }
    // };

    // const toggleDraftTableVisibility = () => {
    //     setIsTableVisible(!isTableVisible);
    // };

    return (
        <div id="main" className="container">
            {/* <div id="draft">
                <button type="button" id="showBtn" onClick={toggleDraftTableVisibility}>
                    {isTableVisible ? 'Hide' : 'Show'} saveDraftTable
                </button>
                {isTableVisible && (
                    <table id="draftTable">
                        <thead>
                            <tr>
                                <th></th>
                                <th width='50px'>Recipe title</th>
                                <th width='300px'>Create date</th>
                                <th width='300px'>Last update</th>
                            </tr>
                        </thead>
                        <tbody id='draftTB' key={keyDraftTable}>
                            {draftsList && draftsList.map((item, i) => (
                                <tr key={i}>
                                    <td><input type='checkbox' id={`select` + i} name={`select` + i} value={i} /></td>
                                    <td>{`Draft${i + 1}`}</td>
                                    <td>{item.createTime}</td>
                                    <td>{item.lastUpdateTime}</td>
                                    <td><button id='loadBtn' onClick={() => loadDraft(i)}>Load</button></td>
                                </tr>
                            ))}
                            <tr><td><button id='deleteBtn' onClick={handleDeleteDraft}>Delete</button></td></tr>
                        </tbody>
                    </table>
                )}
            </div> */}
            <form id="recipe" encType="multipart/form-data">
                <div>
                    <h2>Edit your recipe</h2>
                    <h3 name="message" id="message" style={{ backgroundColor: 'lightGreen' }}>{state}</h3>
                    <table>
                        <tbody>
                            <tr>
                                <td>Recipe title:</td>
                                <td><input type="text" name="recipeTitle" id="recipeTitle" onChange={handleFormValue_Recipe} required /></td>
                            </tr>
                            <tr>
                                <td>Recipe type:</td>
                                <td><input type="text" name="recipeType" id="recipeType" onChange={handleFormValue_Recipe} required /></td>
                            </tr>
                            <tr>
                                <td>Description:</td>
                                <td><textarea name="description" id="description" style={{ width: '500px', height: '100px', resize: 'none' }} onChange={handleFormValue_Recipe}></textarea></td>
                            </tr>
                            <tr>
                                <td>Serving size:</td>
                                <td><input type="number" name="servingSize" id="servingSize" onChange={handleFormValue_Recipe} /></td>
                            </tr>
                            <tr>
                                <td>Prepare time(Minute):</td>
                                <td><input type="number" name="prepareTime" id="prepareTime" onChange={handleFormValue_Recipe} /></td>
                            </tr>
                            <tr>
                                <td>Cook time(Minute):</td>
                                <td><input type="number" name="cookTime" id="cookTime" onChange={handleFormValue_Recipe} /></td>
                            </tr>
                            <tr>
                                <td>Difficulty level:</td>
                                <td>
                                    <select name="difflvl" id="difflvl" onChange={handleFormValue_Recipe} >
                                        <option value="">Select</option>
                                        <option value="1">1 (eazy)</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5 (hard)</option>
                                    </select>
                                </td>
                            </tr>
                            <UploadFile comId={'cp'} setImageName={setImageName} type={"recipe"} />
                            <tr>
                                <td><button type="button" id='cp' onClick={updateExistRecipe} >Save</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr />
                <EditableList
                    key={keyStep}
                    title="Step of your recipe"
                    purpose="step"
                    initialAttributes={recipe.steps || [{ content: "" }]} // Fallback for undefined steps
                    onListChange={updateSteps}
                    renderInput={(item, updateItem) => (
                        <>
                            <td><textarea value={item.content} onChange={(e) => updateItem('content', e.target.value)} /></td>
                        </>
                    )}
                />

                <hr />
                <EditableList
                    key={keyIngredient}
                    title="Ingredient of your recipe"
                    purpose="ingredient"
                    initialAttributes={recipe.ingredients || [{ ingredientName: "", weight: "", unit: "" }]} // Fallback for undefined ingredients
                    onListChange={updateIngredients}
                    renderInput={(list, updateFunction) => (
                        <>
                            <td>Name:</td>
                            <td>
                                <input
                                    type="text"
                                    value={list.ingredientName}
                                    onChange={e => updateFunction('ingredientName', e.target.value)}
                                />
                            </td>
                            <td>Weight:</td>
                            <td>
                                <input
                                    type="number"
                                    style={{ width: '50px', resize: 'none' }}
                                    value={list.weight}
                                    onChange={e => updateFunction('weight', e.target.value)}
                                />
                            </td> 
                            <td>Unit:</td>
                            <td>
                                <select
                                    value={list.unit}
                                    onChange={e => updateFunction('unit', e.target.value)}
                                >
                                    <option key={1} value=''>Select</option>
                                    {(weight_unit || []).map((item, i) => ( // Fallback for undefined weight_unit
                                        <option key={i + 1} value={item.unitName}>{item.unitName}</option>
                                    ))}
                                </select>
                            </td>
                        </>
                    )}
                />
            </form>
        </div>
    );
}

export default EditRecipe;
