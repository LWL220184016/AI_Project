
import './header.css';
import './login.css';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkUserLogin } from '../store/modules/user';

// import loginout from './function/loginout.jsx';

// if you want to import Header2 but not import Header1 in other file, use the following code:
// import { Header2 } from './header.jsx';

async function userLogout(setData, data) {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    // if (window.confirm("Are you sure you want to logout?")) {
    try {
        const response = await fetch(`${apiUrl}/api/logout`, {
            method: 'GET', // Specify the method
            headers: {
                'Content-Type': 'application/json', // Set the content type
            },
            credentials: 'include', // Include cookies
        });
        if (!response.ok) {
            const errorData = await response.json(); // Parse the response body as JSON
            throw new Error(errorData.message);
        }
        data = await response.json();
        setData(data);
        if (data.message === 'ok') {
            window.location.reload(true);
        }
    } catch (error) {
        console.error('There has been a problem with your fetch operation: ', error);
    }
    // }
}

function Header1({ setShowModal, avatar }) {
    const [data, setData] = useState("");
    const dispatch = useDispatch();
    const userName = useSelector(state => state.user.userName);
    useEffect(() => {
        dispatch(checkUserLogin());
    }, [dispatch]);

    var btnLoginout;

    if (userName === 'Guest' || userName === '' || userName === undefined) {
        btnLoginout = <button id="login" onClick={() => setShowModal("login")}>login</button>;
    } else {
        btnLoginout = <button id="logout" onClick={() => userLogout(setData, data)}>logout</button>;
    }
    // console.log(avatar);

    return (
        <header>
            <div id="header"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                { avatar }
                <h1>{'' !== userName ? `${userName}, ` : ''}Welcome to IVE Food Recipe Platform!!</h1>
                {btnLoginout}
            </div>
        </header>
    );
}

export default Header1;
