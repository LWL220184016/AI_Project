import React, { useEffect, useState } from 'react';
import './login.css';
import './register.css';
import { useDispatch, useSelector } from 'react-redux';
import { userLogin } from '../store/modules/user';

function Login({ setShowModal }) {
    const [isChecked, setIsChecked] = useState(false);
    const [isUserLogin, setIsUserLogin] = useState(false);
    const [user, setUser] = useState({
        userName: "",
        password: "",
    });

    const dispatch = useDispatch();
    const state = useSelector(state => state.user.state);

    useEffect(() => {
        if (isUserLogin) {
            dispatch(userLogin(user));
            setIsUserLogin(false);
        }
    }, [isUserLogin, user, dispatch]);

    useEffect(() => {
        if (state === "success") {
            window.location.reload();
        }
    }, [state]);

    const toggleCheck = () => {
        setIsChecked(!isChecked);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setIsUserLogin(true);
        }
    };

    const handleFormValue = (event) => {
        setUser(prev => ({
            ...prev,
            [event.target.name]: event.target.value
        }));
    };

    return (
        <div className="container">
            <h1>Login</h1>
            <p id="state">{state}</p>
            <form method="post">
                <label htmlFor="userName">User Name</label>
                <input
                    type="text"
                    id="userName"
                    name="userName"
                    onChange={handleFormValue}
                    onKeyDown={handleKeyPress}
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    onChange={handleFormValue}
                    onKeyDown={handleKeyPress}
                    required
                /> <br></br>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            checked={isChecked}
                            onChange={toggleCheck}
                        /> &nbsp;
                        <label
                            id="lblremember"
                            name="lblremember"
                            onClick={toggleCheck}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            Remember me
                        </label>
                    </div>
                </div>
                <br />
                <div style={{ textAlign: 'center' }}>
                <button type="button" className="btn" onClick={() => setIsUserLogin(true)}>Login</button>&nbsp;
                <button type="button" className="btn" onClick={() => setShowModal("register")}>Registration</button><br></br><br></br>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <a href="/"><label>Continue as guest</label></a>
                    &nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;
                    <a href=""><label>Forget password?</label></a>
                </div>
            </form>
        </div>
    );
}

export default Login;