import React, { useEffect, useState } from 'react';
import './login.css';
import './register.css';
import EmailVerification from './email_verification';
import { userRegister } from '../store/modules/user';
import { useDispatch, useSelector } from 'react-redux';

function Register({ setShowModal }) {
    const [isUserRegister, setIsUserRegister] = useState(false);
    const [EmailVerify, showEmailVerify] = useState(false);
    const [user, setUser] = useState({
        userName: "",
        password: "",
    });

    const dispatch = useDispatch();
    useEffect(() => {
        if (isUserRegister) {
            (async () => {
                dispatch(userRegister(user));
            })();
            setIsUserRegister(false);
        }
    }, [isUserRegister, user, dispatch]);
    const state = useSelector(state => state.user.state);
    useEffect(() => {
        console.log(state);
        switch (state) {
            case "User created successfully!":
                setShowModal("login");
                break;
            default:
                break;
        }
    }, [state, setShowModal]);

    const handleFormValue = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => {
            const updatedUser = {
                ...prevUser,
                [name]: value
            };
            console.log(updatedUser);
            return updatedUser;
        });
    };

    return (
        <div className="container">
            <h1>Register</h1>
            <p id="state">{state}</p>
            <form method="post">
                <label htmlFor="username">User Name</label>
                <input
                    type="text"
                    id="username"
                    name="userName"
                    required
                    onChange={handleFormValue}
                />

                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    onChange={handleFormValue}
                />

                <div style={{ textAlign: 'center' }}>
                    <button
                        type="button"
                        id="Register"
                        className="btn"
                        onClick={() => setIsUserRegister(true)}
                    >
                        Register
                    </button>&nbsp;
                    <button
                        type="button"
                        className="btn"
                        onClick={() => setShowModal("login")}
                    >
                        Back
                    </button>
                </div>
            </form>

            {!EmailVerify && (
                <>
                    <h2>Do you want to add an email to your account?</h2>
                    <button
                        type="button"
                        className="btn"
                        onClick={() => showEmailVerify(true)}
                    >
                        Add email
                    </button>
                </>
            )}
            {EmailVerify && <EmailVerification />}
        </div>
    );
}

export default Register;