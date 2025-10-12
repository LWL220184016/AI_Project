
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function EditableList({ title, purpose, renderInput, initialAttributes = [], onListChange }) {
  const [lists, setLists] = useState(initialAttributes.map(item => ({ ...item, id: uuidv4() })));

  const addRow = () => {
    const newLists = [...lists, { id: uuidv4() }];
    setLists(newLists);
    onListChange(newLists);
  };

  const deleteRow = (index) => {
    const newLists = lists.filter((_, i) => i !== index);
    setLists(newLists);
    onListChange(newLists);
  };

  const updateField = (index, field, value) => {
    const newLists = [...lists];
    newLists[index][field] = value;
    setLists(newLists);
    onListChange(newLists);
  };

  return (
    <div id={`${purpose}Div`}>
      <table id={`${purpose}Table`}>
        <thead>
          <tr>
            <td colSpan="4"><h2>{title}</h2></td>
          </tr>
        </thead>
        <tbody>
          {lists.map((list, index) => (
            <tr key={list.id}>
              <td><p>{purpose + " " + (index + 1) + ": "}</p></td>
              {renderInput ? renderInput(list, (field, value) => updateField(index, field, value)) : null}
              <td><button type="button" onClick={() => deleteRow(index)}>Delete</button></td>
              <td><button type="button" onClick={addRow}>Add more</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EditableList;