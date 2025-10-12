import '../App.css';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkUserLogin, fetchAvatar } from '../store/modules/user';
import { useNavigate, useLocation } from 'react-router-dom';
import { createContext } from 'react';
import { useContext } from 'react';

const NavigationContext = createContext({ changePage: () => { }, page: '' });

function NavigationWrapper({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [page, setPage] = useState(location.pathname);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(checkUserLogin());
    }, [dispatch]);
    const username = useSelector(state => state.user.userName);

    const changePage = (newPage) => {
        const guestAllowPage = ['', '/', '/main', '/food_search', '/chat'];

        if (newPage !== '/' && !guestAllowPage.includes(newPage) && (!username || username === '')) {
            alert('Please login first!');
        } else {
            console.log('set page: ' + newPage + ', page: ' + page);
            setPage(newPage);
        }
    }

    useEffect(() => {
        navigate(page);
    }, [page, navigate]);
    // console.log(children);
    return (
        <NavigationContext.Provider value={{ changePage, page }} >
            {children}
        </NavigationContext.Provider>
    );
}

function Navigation1() {
    const { changePage, page } = useContext(NavigationContext);

    return (
        <nav>
            <div className="nav-button-container">
                <button onClick={() => changePage('/')} className={`nav-button${page === '/' ? '-activate' : ''}`}>Main</button>
            </div>
            <div className="nav-button-container">
                <button onClick={() => changePage('/release')} className={`nav-button${page === '/release' ? '-activate' : ''}`}>new recipe</button>
            </div>
            <div className="nav-button-container">
                <button onClick={() => changePage('/my_recipe')} className={`nav-button${page === '/my_recipe' ? '-activate' : ''}`}>My recipe</button>
            </div>
            <div className="nav-button-container">
                <button onClick={() => changePage('/food_search')} className={`nav-button${page === '/food_search' ? '-activate' : ''}`}>Food search</button>
            </div>
            <div className="nav-button-container">
                <button onClick={() => changePage('/chat')} className={`nav-button${page === '/chat' ? '-activate' : ''}`}>Chat</button>
            </div>
        </nav>
    );
}

function Avatar() {
    const { changePage } = useContext(NavigationContext);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchAvatar());
    }, [dispatch]);
    const avatar = useSelector(state => state.user.avatar);

    return (
        <img src={avatar} alt="Avatar" onClick={() => changePage('/profile')} />
    )
}

export { Navigation1, Avatar, NavigationWrapper };

export default Navigation1;