import './header.css';
import './my_recipe.css';
import './food_search.css';
import FoodDetails from './food_details.jsx';
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFoodsList } from '../store/modules/foods.js';
import { orderBy } from 'lodash';


function FoodSearch() {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchFoodsList());
    }, [dispatch])
    const { foodsList } = useSelector(state => state.foods);

    const [sort, setSort] = useState("");
    const [searchTerm, setSearchTerm] = useState(""); // State for search input

    const filteredFoodList = useMemo(() => {
        return foodsList.filter(food =>
            food.foodName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [foodsList, searchTerm]);

    const sortedFoodList = useMemo(() => {
        return orderBy(filteredFoodList, [sort], ['desc']);
    }, [filteredFoodList, sort]);

    const handleSortChange = (sort) => {
        setSort(sort);
    };

    const [showModal, setShowModal] = useState(false);

    return (
        <div id="main">
            <div className="search-container">
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search for food..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {showModal !== false && (
                <div className="modal">
                    <button className="editBtn" onClick={() => setShowModal(false)}>Close</button>
                    <FoodDetails name={showModal} />
                </div>
            )}
            <div className="table-container">
                <table className='food-table' border={1}>
                    <thead>
                        <tr>
                            <th>Food Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedFoodList && sortedFoodList.length > 0 ? (
                            sortedFoodList.map(item => (
                                <tr key={item.foodName}>
                                    <td>{item.foodName}</td>
                                    <td><button onClick={() => setShowModal(item.foodName)}>More details</button></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2">No food found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default FoodSearch;
