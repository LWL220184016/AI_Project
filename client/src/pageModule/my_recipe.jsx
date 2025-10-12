import './header.css';
import './my_recipe.css';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserRecipesList } from '../store/modules/recpies.js';
import { deleteRecipe } from '../store/modules/recipe_details.js';
import { orderBy } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

function My_recipe ({setShowModal}) {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchUserRecipesList());
    }, [dispatch]);
    const { recipesList } = useSelector(state => state.recipes);

    const sorts = [
        { name: 'date' }, { name: 'rating' }
    ]
    const [sort, setSort] = useState("");
    const [keyRecipeListTable, setKeyRecipeListTable] = useState(uuidv4());
    const [searchTerm, setSearchTerm] = useState(""); // State for search input

    const filteredRecipeList = useMemo(() => {
        return recipesList.filter(recipe =>
            recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [recipesList, searchTerm]);

    const sortedRecipeList = useMemo(() => {
        return orderBy(filteredRecipeList, [sort], ['desc']);
    }, [filteredRecipeList, sort]);

    const handleSortChange = (sort) => {
        setSort(sort);
    }

    const handleDeleteDraft = async () => {
        var recipeIDs = [];
        for (let i = 0; i < recipesList.length; i++) {
            if (document.getElementById('select' + i).checked) {
                recipeIDs.push(recipesList[i].recipeID);
            }
        }
        dispatch(deleteRecipe(recipeIDs));
    };
    const state = useSelector(state => state.recipe.state);
    useEffect(() => {
        console.log(state);
        if (state) {
            try { // when delete more than one times, the state will not be updated so that the table will not be updated
                if (state === "Delete successfully.") {
                    dispatch(fetchUserRecipesList());
                    setKeyRecipeListTable(uuidv4());
                }
                // setState(state);
            } catch (e) {
                console.log(e.message);
            }
        }
    }, [state, dispatch]);

    return (
        <div id="my_recipe">
            <div className="search-container">
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search for your recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                {sorts.map(({ name }) => (
                    <button
                        key={name}
                        onClick={() => handleSortChange(name)}
                        className={`sortItem${sort === name && "Active"}`}
                        style={{ marginRight: '10px' }}
                    >{name}
                    </button>
                ))}
            </div>
            <h3 name="message" id="message" style={{ backgroundColor: 'lightGreen' }}>{state}</h3>
            <div className="table-container">
                <table className='recipe-table' border={1} key={keyRecipeListTable}>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Recipe name</th>
                            <th>Difficulty level</th>
                            <th>rating</th>
                            <th>type</th>
                            <th>author</th>
                            <th>date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRecipeList && sortedRecipeList.length > 0 ? (
                            sortedRecipeList.map((item, i) => (
                                <tr key={item.recipeID}>
                                    <td><input type='checkbox' id={`select` + i} name={`select` + i} value={i} /></td>
                                    <td>{item.title}</td>
                                    <td>{item.difficultyLevel}</td>
                                    <td>{item.rating}</td>
                                    <td>{item.type}</td>
                                    <td>{item.userName}</td>
                                    <td>{item.releaseDate}</td>
                                    <td><button id={"editBtn"} onClick={() => setShowModal(`editRecipe${item.recipeID}`)}>edit</button></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10">No any recipe found</td>
                            </tr>
                        )}
                        <tr><td><button id='deleteBtn' onClick={handleDeleteDraft}>Delete</button></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default My_recipe;