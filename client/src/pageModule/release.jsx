import React, { useState, useEffect } from 'react';
import './release.css';
import ReleaseYourRecipe from './ReleaseYourRecipe';
import StepOfYourRecipe from './StepOfYourRecipe';
import IngredientOfYourRecipe from './IngredientOfYourRecipe';
import UploadFile from './uploadFile';
import useSaveDraftToDB from '../customHook/saveDraftToDB';
import { v4 as uuidv4 } from 'uuid';

import { useDispatch, useSelector } from 'react-redux';
import { fetchDraftsList } from '../store/modules/drafts';
import { fetchDraftDetails, resetDraftDetails } from '../store/modules/draft_details';
import { createRecipe } from '../store/modules/recipe_details';

function Release() {
    const [state, setState] = useState(''); // State to hold the status message
    const [timeoutId, setTimeoutId] = useState(null);
    const [currentStep, setCurrentStep] = useState(1); // Track the current step
    const [isSaveDraft, setIsSaveDraft] = useState(0);
    const [formData, setFormData] = useState({
        draftID: 0,
        recipeTitle: '',
        recipeType: '',
        description: '',
        servingSize: 0,
        prepareTime: 0,
        cookTime: 0,
        difflvl: 0,
        steps: [{ content: '' }],
        ingredients: [{ ingredientName: '', weight: '', unit: '' }],
    });
    const [keyDraftTable, setKeyDraftTable] = useState(uuidv4());
    const [keyStep, setKeyStep] = useState(uuidv4());
    const [keyIngredient, setKeyIngredient] = useState(uuidv4());
    const [imageName, setImageName] = useState(""); // imageName here because release recipe needs to be uploaded it to database
    const [isTableVisible, setIsTableVisible] = useState(false); // State to control table visibility
    const { saveDraftToDB, updateDraftToDB, deleteDraftsFromDB } = useSaveDraftToDB();

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchDraftsList());
        console.log('imageName:', imageName);
    }, [dispatch])
    let { draftsList } = useSelector(state => state.drafts);
    const recipeState = useSelector(state => state.recipe.state);

    useEffect(() => {
        console.log('draftsList:', draftsList);
        setKeyDraftTable(uuidv4());
    }, [draftsList]);

    useEffect(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const newTimeoutId = setTimeout(() => {
            if (isSaveDraft > 0) {
                if (formData.draftID === 0) {
                    saveDraftToDB(formData).then((message) => {
                        setState(message);
                        dispatch(fetchDraftsList());
                    });// fetchDraftsList must be called after saveDraftToDB response
                    setFormData({
                        ...formData,
                        draftID: -1
                    })
                } else {
                    updateDraftToDB(formData.draftID, formData);
                }
            }
        }, 100);
        setTimeoutId(newTimeoutId);
        return () => clearTimeout(newTimeoutId); // Cleanup timeout on component unmount
    }, [isSaveDraft]);

    useEffect(() => {
        console.log(recipeState);
        if (recipeState === "success") {
            newRecipe();
            setState("Recipe released successfully!");
            dispatch(resetDraftDetails());
            dispatch(fetchDraftsList());
        }
    }, [recipeState, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setIsSaveDraft(isSaveDraft + 1);
    };

    const updateSteps = (steps) => {
        setFormData((prevData) => ({
            ...prevData,
            steps,
        }));
        setIsSaveDraft(isSaveDraft + 1);
    };

    const updateIngredients = (ingredients) => {
        setFormData((prevData) => ({
            ...prevData,
            ingredients,
        }));
        setIsSaveDraft(isSaveDraft + 1);
    };

    const goToNextStep = () => setCurrentStep((prevStep) => prevStep + 1);
    const goToPreviousStep = () => setCurrentStep((prevStep) => prevStep - 1);

    const newRecipe = () => {
        setFormData({
            draftID: 0,
            recipeTitle: '',
            recipeType: '',
            description: '',
            servingSize: 0,
            prepareTime: 0,
            cookTime: 0,
            difflvl: 0,
            steps: [{ content: '' }],
            ingredients: [{ ingredientName: '', weight: '', unit: '' }],
        });

        dispatch(resetDraftDetails());
        setKeyStep(uuidv4()); // Update key to force re-render
        setKeyIngredient(uuidv4()); // Update key to force re-render
        setState("");
    };

    const loadDraft = (draftIndex) => {
        // Check if draftIndex is within the valid range
        if (draftIndex < 0 || draftIndex >= draftsList.length) {
            alert('Please select a draft!');
            return;
        }

        // Destructure the draft object
        const draft = draftsList[draftIndex];
        const draftID = draft.draftID;

        // Log the draftID for debugging purposes
        console.log('draftID:', draftID);

        // Dispatch the action to fetch draft details
        dispatch(fetchDraftDetails(draftID));
    };
    const draftDetails = useSelector(state => state.draft.draftDetails);
    useEffect(() => {
        // console.log('draftDetails:', draftDetails);
        if (draftDetails[0]) {
            const draftDataCopy = { ...draftDetails[0]["data"], draftID: draftDetails[0].draftID };
            console.log('draftDetails:', draftDataCopy);

            setFormData(draftDataCopy);
            setKeyStep(uuidv4()); // Update key to force re-render
            setKeyIngredient(uuidv4()); // Update key to force re-render
            setState(`Loading draft ${draftDataCopy.draftID}!`);
        }
    }, [draftDetails]);

    const handleDeleteDraft = async () => {
        var draftIDs = [];
        for (let i = 0; i < draftsList.length; i++) {
            if (document.getElementById('select' + i).checked) {
                draftIDs.push(draftsList[i].draftID);
            }
        }
        if (draftIDs.length === 0) {
            alert('Please select drafts to delete!');
            return;
        }

        const result = await deleteDraftsFromDB(draftIDs);
        if (result) {
            try {
                if (result === "Re-render") {
                    dispatch(fetchDraftsList());
                }
            } catch (e) {
                setState(e.message);
            }
        }
    };

    const toggleDraftTableVisibility = () => {
        setIsTableVisible(!isTableVisible);
    };

    const handleSubmit = () => {
        console.log('Form Data Submitted:', formData);
        alert('Recipe Released Successfully!');
        dispatch(createRecipe(formData, imageName));
    };

    return (
        <div className="release-container">
            <div id="draft">
                <button type="button" id="showBtn" onClick={toggleDraftTableVisibility}>
                    {isTableVisible ? 'Hide' : 'Show'} saveDraftTable
                </button>
                {isTableVisible && (
                    <div className="table-container">
                        <div className="scrollable-table">
                            <table id="draftTable">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th width='50px'>Recipe title</th>
                                        <th width='300px'>Create date</th>
                                        <th width='300px'>Last update</th>
                                        <td><button id='newRecipe' onClick={newRecipe}>new</button></td>
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
                        </div>
                    </div>
                )}
            </div>
            {state}
            <div className="form-container">
                {currentStep === 1 && (
                    <ReleaseYourRecipe
                        formData={formData}
                        handleChange={handleChange}
                        goToNextStep={goToNextStep}
                    />
                )}
                {currentStep === 2 && (
                    <StepOfYourRecipe
                        key={keyStep}
                        steps={formData.steps}
                        updateSteps={updateSteps}
                        goToPreviousStep={goToPreviousStep}
                        goToNextStep={goToNextStep}
                    />
                )}
                {currentStep === 3 && (
                    <IngredientOfYourRecipe
                        key={keyIngredient}
                        ingredients={formData.ingredients}
                        updateIngredients={updateIngredients}
                        goToPreviousStep={goToPreviousStep}
                    />
                )}
            </div>
            <label>Image: </label>
            <UploadFile comId={'cp'} setImageName={setImageName} type={"recipe"} />
            <button id='cp' className="ingredient-button ingredient-release-button" onClick={handleSubmit}>
                Release
            </button>&nbsp;
        </div>
    );
}

export default Release;