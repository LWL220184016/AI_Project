import './header.css';
import { fetchUserDetails, updateProfile } from '../store/modules/user';
import { useDispatch, useSelector } from 'react-redux';
import UploadFile, { generateRandomString } from './uploadFile';
import React, { useEffect, useState, useCallback } from 'react';
import { Avatar } from './navigation';
import EmailVerification from './email_verification';

function Profile() {
    const [imageName, setImageName] = useState(""); // imageName here because release recipe needs to be uploaded it to database
    const [user_profile, setUser_profile] = useState();

    const dispatch = useDispatch();
    useEffect(() => {
        setImageName(generateRandomString(15));

        dispatch(fetchUserDetails());
    }, [dispatch]);
    const { user } = useSelector(state => state.user);
    const state = useSelector(state => state.user.state);
    useEffect(() => {
        if (state === "success") {
            window.location.reload();
        }
    }, [state]);
    function showEdit() {
        const editDiv = document.getElementById('edit').style.display;
        console.log(editDiv);
        if (editDiv !== 'block') {
            document.getElementById('edit').style.display = 'block';
            console.log(user);
            setUser_profile({
                userName: user[0].userName,
                country: user[0].country ? user[0].country : ''
            });
        } else {
            document.getElementById('edit').style.display = 'none';
        }
    }

    const handleFormValue_Profile = (e) => {
        const { name, value } = e.target;
        setUser_profile((prevUser_profile) => {
            const updatedUser_profile = {
                ...prevUser_profile,
                [name]: value
            };
            //setIsSaveDraft(isSaveDraft + 1);
            console.log(updatedUser_profile);
            return updatedUser_profile;
        });
    };

    const _updateProfile = () => {
        dispatch(updateProfile(user_profile, imageName));
    };

    return (
        <div id='main'>
            <h1>Profile</h1>
            <h3 name="message" id="message" style={{ backgroundColor: 'lightGreen' }}>{state}</h3>
            {user && user.length > 0 ? user.map(item => (
                <>
                    <div key={item.userName}>
                        <Avatar />
                        <p>User name: {item.userName}</p>
                        <p>Email: {item.userEmail}</p>
                        <p>Account creation date: {item.accCreationDate}</p>
                    </div>
                    <button onClick={showEdit}>Edit</button>
                    <div id='edit' hidden>
                        <form>
                            <table>
                                <thead>
                                    <tr><th>Edit profile</th></tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>User name</td>
                                        <td><input type='text' name='userName' defaultValue={item.userName} onChange={handleFormValue_Profile} /></td>
                                    </tr>
                                    <tr>
                                        <td>Avatar</td>
                                        <td><UploadFile comId={'update'} setImageName={setImageName} type={"avatar"} /></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}><EmailVerification /></td>
                                    </tr>
                                    <tr>
                                        <td>Country / Region</td>
                                        <td>
                                            <input list="country-suggestions" name="country" defaultValue={item.country} onChange={handleFormValue_Profile} />
                                            <datalist id="country-suggestions">
                                                <option value="United States" />
                                                <option value="Canada" />
                                                <option value="United Kingdom" />
                                                <option value="Australia" />
                                            </datalist>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <button type="button" id='update' onClick={_updateProfile} >Save</button>
                        </form>
                    </div>
                </>
            )) : (
                <p>No user data available.</p>
            )}
        </div>

    );
}

export default Profile;