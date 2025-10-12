import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_BASE_URL;

const userStore = createSlice({
	name: 'user',
	initialState: {
		user: [],
		state: null,
		userName: '', // Because this requires an entry call, it is separated
		avatar: null  // Because this requires an entry call, it is separated
	},
	reducers: {
		setUserDetails(state, action) {
			state.user = action.payload;
		},
		setProcessState(state, action) {
			state.state = action.payload; // Update state separately
		},
		setUserName(state, action) {
			state.userName = action.payload; // Update state separately
		},
		setAvatar(state, action) {
			state.avatar = action.payload; // Update state separately
		}
	}
});

const { setUserDetails, setProcessState, setUserName, setAvatar } = userStore.actions;

const fetchUserDetails = () => {
	return async (dispatch) => {
		try {
			const response = await axios({
				method: 'get',
				url: `${apiUrl}/api/userDetails`,
				withCredentials: true,
				headers: {
					'Content-Type': 'application/json',
				},
			});
			dispatch(setUserDetails(response.data));
		} catch (error) {
			console.error('There has been a problem with your fetch operation: ', error);
		}
	}
}

const userLogin = (user) => {
	if (!user || !user.userName || !user.password) {
		return setProcessState('Please input a valid username and password.');
	}
	return async (dispatch) => {
		try {
			const response = await axios({
				method: 'post',
				url: `${apiUrl}/api/login`,
				data: { userName: user.userName, password: user.password },
				withCredentials: true,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.status !== 200) {
				throw new Error(response.data.message);
			}

			const data = response.data;

			switch (data.message) {
				case "success":
					dispatch(setProcessState("success"));
					break;
				case "PIVUN":
					dispatch(setProcessState("Please input a valid username."));
					break;
				case "PIVPW":
					dispatch(setProcessState("Please input a valid password."));
					break;
				case "LF":
					dispatch(setProcessState("Login failed, user name or password not correct."));
					break;
				default:
					dispatch(setProcessState(JSON.stringify(data.message)));
			}
		} catch (error) {
			console.error('There has been a problem with your fetch operation: ', error);
			dispatch(setProcessState('Login failed due to server error.'));
		}
	}
}

const userRegister = (user) => {
	if (!user || !user.userName || !user.password) {
		return setProcessState('Please input a valid username and password.');
	}
	return async (dispatch) => {
		try {
			const response = await fetch(`${apiUrl}/api/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ userName: user.userName, password: user.password }),
				credentials: 'include',
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message);
			}
			const data = await response.json();
			switch (data.message) {
				case "PIVUN":
					dispatch(setProcessState("Please input a valid username."));
					break;
				case "PIVPW":
					dispatch(setProcessState("Please input a valid password."));
					break;
				case "UCS":
					dispatch(setProcessState("User created successfully!"));
					break;
				case "PAE":
					dispatch(setProcessState("Password already exists. Please try again."));
					break;
				case "UAE":
					dispatch(setProcessState("Username already exists, please choose another."));
					break;
				default:
					dispatch(setProcessState(JSON.stringify(data.message)));
			}
		} catch (error) {
			console.error('There has been a problem with your fetch operation: ', error);
		}
	}
}

const updateProfile = (user, imageName) => {
	return async (dispatch) => {

		console.log(user);
		if (user === undefined) {
			alert('Nothing is changed.');
			return;
		}
		const emptyFields = [];
		for (const item in user) {
			if (user[item] === '') {
				switch (item) {
					case 'userName':
						emptyFields.push('User name');
						break;
					default:
						break;
				}
			}
		}
		if (emptyFields.length > 0) {
			alert(emptyFields.join(', ') + ' could not be empty.');
			return;
		}

		try {
			const response = await axios({
				method: 'put',
				url: `${apiUrl}/api/updateProfile`,
				data: { user, imageName },
				withCredentials: true,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.status !== 200) {
				throw new Error(response.data.message);
			}

			const data = response.data;
			console.log(data);

			if (data.message === "success") {
				// dispatch(resetDraftDetails());
				// setKeyDraftTable(uuidv4()); // Update key to force re-render
			}
			if (data.message) {
				try {
					const parsedMessage = JSON.parse(data.message);
					dispatch(setProcessState(parsedMessage));
				} catch (e) {
					dispatch(setProcessState(data.message));
				}
			}
		} catch (error) {
			console.error('There has been a problem with your fetch operation: ', error);
		}
	}
}

const checkUserLogin = () => {
	return async (dispatch) => {
		try {
			const response = await axios.get(`${apiUrl}/api/checkUser`, {
				withCredentials: true,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.status !== 200) {
				throw new Error(response.data.message);
			}

			const data = response.data.userName;
			// console.log(response)
			if (data === '' || data === undefined) {
				dispatch(setUserName(data));
			} else {
				dispatch(setUserName(data));
			}
		} catch (error) {
			console.error('There has been a problem with your fetch operation: ', error);
		}
	}
}

const fetchAvatar = () => {
	return async (dispatch) => {
		try {
			const response = await axios.get(`${apiUrl}/api/getAvatar`, {
				withCredentials: true,
				headers: {
					'Content-Type': 'application/json',
				},
				responseType: 'blob', // Tell axios to expect a Blob
			});

			if (response.status !== 200) {
				throw new Error(response.data.message);
			}

			const url = URL.createObjectURL(response.data); // Create a URL representing the image file
			dispatch(setAvatar(url));
		} catch (error) {
			console.error('There has been a problem with your fetch operation: ', error);
		}
	}
}

export { fetchUserDetails, userLogin, userRegister, updateProfile, checkUserLogin, fetchAvatar };

const reducer = userStore.reducer;
export default reducer;