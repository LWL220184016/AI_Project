import './header.css';
import './my_recipe.css';
import './login.css';
import RecipeDetails from './recipe_details.jsx';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipesList } from '../store/modules/recpies';
import { orderBy } from 'lodash';

function Main() {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchRecipesList());
    }, [dispatch])
    const { recipesList } = useSelector(state => state.recipes);

    const sorts = [
        { name: 'name' }, { name: 'type' }, { name: 'rating' }
    ]
    const [sort, setSort] = useState("");
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

    const [showModal, setShowModal] = useState(false);

    return (
        <div id="main" style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '50px' }}>
                <div style={{ flex: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="search-container" style={{ width: '90%', maxWidth: '1200px' }}>
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="Search for recipes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', width: '90%', maxWidth: '1200px', marginTop: '10px' }}>
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
                    {showModal !== false && (
                        <div className="modal">
                            <button className="editBtn" onClick={() => setShowModal(false)}>關閉</button>
                            <RecipeDetails id={showModal} />
                        </div>
                    )}
                    <div style={{ width: '90%', maxWidth: '1200px', overflowX: 'auto' }}>
                        <table className='recipe-table' border={1} style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Author</th>
                                    <th>Recipe name</th>
                                    <th>Recipe type</th>
                                    <th>Difficulty level</th>
                                    <th>Rating</th>
                                    <th>Release date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedRecipeList && sortedRecipeList.length > 0 ? (
                                    sortedRecipeList.map(item => (
                                        <tr key={item.recipeID}>
                                            <td>{item.userName}</td>
                                            <td>{item.title}</td>
                                            <td>{item.type}</td>
                                            <td>{item.difficultyLevel}</td>
                                            <td>{item.rating === '0' ? ('No rating') : (item.rating)}</td>
                                            <td>{item.releaseDate}</td>
                                            <td><button onClick={() => setShowModal(item.recipeID)}>More details</button></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10">No any recipe found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px', marginLeft: '20px' }}>
                <h3>About Food</h3>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '10px' }}>
                        <a href="https://foodandwineaesthetics.com/2024/03/11/the-art-of-cooking/" style={{ color: '#2196F3', textDecoration: 'none' }}>The Art of Cooking</a>
                    </li>
                    <li style={{ marginBottom: '10px' }}>
                        <a href="https://www.medicalnewstoday.com/articles/322268" style={{ color: '#2196F3', textDecoration: 'none' }}>Healthy Eating</a>
                    </li>
                    <li style={{ marginBottom: '10px' }}>
                        <a href="https://www.linkedin.com/pulse/exploring-global-cuisines-journey-through-sdp1c" style={{ color: '#2196F3', textDecoration: 'none' }}>Exploring World Cuisines</a>
                    </li>
                </ul>
            </div>
            <div style={{ backgroundColor: '#2196F3', color: 'white', padding: '20px', textAlign: 'center' }}>
                <h3>About Us</h3>
                <p>Welcome to our recipe sharing platform! We aim to reduce food waste by sharing creative recipes.</p>
                <div>
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', margin: '0 10px' }}>Facebook</a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', margin: '0 10px' }}>Instagram</a>
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', margin: '0 10px' }}>Twitter</a>
                </div>
            </div>
        </div>
    );
}

export default Main;