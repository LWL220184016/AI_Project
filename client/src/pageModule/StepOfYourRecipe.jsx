import React from 'react';
import './StepOfYourRecipe.css'; // Specific styles for Step 2 (optional)
import EditableList from './editableList';

function StepOfYourRecipe({ steps, updateSteps, goToPreviousStep, goToNextStep }) {
    return (
        <div className="step-container">
            <h2>Step of Your Recipe</h2>
            <EditableList
                title="Steps"
                purpose="step"
                initialAttributes={steps}
                onListChange={updateSteps}
                renderInput={(item, updateItem) => (
                    <>
                        <td>
                            <textarea
                                placeholder="Enter Step Description"
                                value={item.content}
                                onChange={(e) => updateItem('content', e.target.value)}
                            />
                        </td>
                    </>
                )}
            />
            <button onClick={goToPreviousStep}>Previous</button>&nbsp;
            <button onClick={goToNextStep}>Next</button>
        </div>
    );
}

export default StepOfYourRecipe;