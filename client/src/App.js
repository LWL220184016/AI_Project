import React, { useState } from 'react';
import './App.css';
import Header1 from './pageModule/header.jsx';
import Main from './pageModule/main.jsx';
import Release from './pageModule/release.jsx';
import MyRecipe from './pageModule/my_recipe.jsx';
import FoodSearch from './pageModule/food_search.jsx';
import Profile from './pageModule/profile.jsx';
import Login from './pageModule/login.jsx';
import Register from './pageModule/register.jsx';
import EditRecipe from './pageModule/edit_recipe.jsx';
import Chat from './pageModule/Chat.jsx';
import { Routes, Route } from 'react-router-dom';

import { Avatar, Navigation1, NavigationWrapper } from './pageModule/navigation.jsx';

function App() {
    const [showModal, setShowModal] = useState(false);

    return (
        <div>
            <NavigationWrapper>
                <Header1 setShowModal={setShowModal} avatar={<Avatar />} />
                <div id="flex-container">
                    <Navigation1 />

                    <Routes>
                        <Route path="/" element={<Main />} />
                        <Route path="/release" element={<Release />} />
                        <Route path="/my_recipe" element={<MyRecipe setShowModal={setShowModal} />} />
                        <Route path="/food_search" element={<FoodSearch />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="*" element={<h1>Not Found</h1>} />
                        </Routes>

                    {showModal === 'login' && (
                        <div className="modal">
                            <button className="modal_btn" onClick={() => setShowModal(false)}>關閉</button>
                            <Login setShowModal={setShowModal} />
                        </div>
                    )}
                    {showModal === 'register' && (
                        <div className="modal">
                            <button className="modal_btn" onClick={() => setShowModal(false)}>關閉</button>
                            <Register setShowModal={setShowModal} />
                        </div>
                    )}
                    {showModal && showModal.startsWith('editRecipe') && (
                        <div className="modal">
                            <button className="modal_btn" onClick={() => setShowModal(false)}>關閉</button>
                            <EditRecipe setShowModal={setShowModal} recipeID={showModal.replace('editRecipe', '')} />
                        </div>
                    )}
                </div>
            </NavigationWrapper>
        </div>
    );
}

export default App;