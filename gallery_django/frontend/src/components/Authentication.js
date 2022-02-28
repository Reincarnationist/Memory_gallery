import React from 'react'
import { Redirect } from 'react-router-dom'
import '../../static/css/authentication.css'
import Button from '@mui/material/Button';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useHistory } from "react-router-dom";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

export default function Authentication( {csrf_token, setCsrfChange} ) {
	// Note: the comment sections in this page is reserved for future scale
	const [errorType, setErrorType] = React.useState('');
	const [loginErrMsg, setLoginErrMsg] = React.useState('');
	const [registerErrMsg, setRegisterErrMsg] = React.useState('');
	const LOGIN_SUCCESS = 'Login successfully'
	const REGISTER_SUCCESS = "Sign up successfully!"
	const history = useHistory();

	const [currentView, setCurrentView] = React.useState('logIn');
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [authenticated_username, setAuthenticated_username] = React.useState('');


	const handleSnackBarClose = (event, reason) => {
		if (reason === 'clickaway') {
		return;
		}
		setErrorType('');
	};

	React.useEffect(() => {
		const logged_in_user = sessionStorage.getItem('username')
		if (logged_in_user){
			setAuthenticated_username(logged_in_user)
		}
	});


	const handleLoginFormSubitted = async e =>{
		e.preventDefault()
		const requestOptions = {
			credentials: "include",
			method: "POST",
			headers: { 
				"Content-Type": "application/json",
				'X-CSRFToken': csrf_token,
				'mode': 'same-origin'
					},
			body: JSON.stringify({
				username: username,
				password: password,
			}),
			};
		fetch("/auth/login/", requestOptions)
			.then(res => {
				if (res.ok){
					// Note: This step is important as the csrf token will silently change after authenticated.
					// Thus we need to obtain it again so that we can logout successfully
					fetch("/auth/csrf/", {method: 'GET'})
						.then(res => res.json())
						.then(data => {
							setCsrfChange(data.csrfToken)
						})
					
					setErrorType('login_success')
					return res.json()
				}else{
					//Warning:
					//Do not raise a new error here then deal with it in the catch
					//technically you can do this but you won't be able to set errorMsg
					//as the error is not serializable like normal objects
					//see this 
					//https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
					

					return res.text().then(text => {

						setErrorType('login_error')
						setLoginErrMsg(String(text).substring(1,String(text).length - 1)) 
						throw new Error('Login failed')
					})

					// this.setState({
					// 	errorMsg: 'Error Code: ' + res.status + ': ' + 'The login process failed, please try again.'
					// })
					
				}})
			.then((data) => {
				sessionStorage.setItem('username', data.user.username)
				setTimeout(() => history.push("/home"), 1000)
			})
			.catch(error =>{
				console.log(error)
			})
	}
	const handleRegisterFormSubitted = async e =>{
		e.preventDefault()
				
		const requestOptions = {
			credentials: "include",
			method: "POST",
			headers: { 
				"Content-Type": "application/json",
				'X-CSRFToken': csrf_token,
				'mode': 'same-origin'
					},
			body: JSON.stringify({
				username: username,
				password: password,
			}),
			};
		fetch("/auth/register/", requestOptions)
			.then(res => {
				if (res.ok){
					// Note: This step is important as the csrf token will silently change after authenticated.
					// Thus we need to obtain it again so that we can logout successfully	
					fetch("/auth/csrf/", {method: 'GET'})
						.then(res => res.json())
						.then(data => {
							setCsrfChange(data.csrfToken)
						})

					setErrorType('register_success')
					return res.json()

				}else{
					//Warning:
					//Do not raise a new error here then deal with it in the catch
					//technically you can do this but you won't be able to set errorMsg
					//as the error is not serializable like normal objects
					//see this 
					//https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
					

					return res.text().then(text => {
						setErrorType('register_error')
						setRegisterErrMsg(String(text).substring(1,String(text).length - 1))
						throw new Error('Registration failed')
					})

					// this.setState({
					// 	errorMsg: 'Error Code: ' + res.status + ': ' + 'The registration process failed, please try again.'
					// })
					
				}})
			.then((data) => {
				sessionStorage.setItem('username', data.user.username)
				setTimeout(() => history.push("/account/" + data.user.username), 1000)
			})
			.catch(error =>{
				console.log(error)
			})

		}
	

	const renderCurrentView = () => {
		switch(currentView) {
		case "signUp":
			return (
			<form onSubmit={handleRegisterFormSubitted}>
				<h2>Sign Up!</h2>
				
				<fieldset>
				<legend>Create Account</legend>
				<ul>
					<li>
					<label htmlFor="username">Username:</label>
					<input 
						type="text" 
						id="username" 
						placeholder='Username'
						onChange={({target}) => setUsername(target.value)}
						required/>
					</li>
					{/* <li>
					<label for="email">Email:</label>
					<input type="email" id="email" required/>
					</li> */}
					<li>
					<label htmlFor="password">Password:</label>
					<input 
						type="password" 
						id="password" 
						placeholder='Password'
						onChange={({target}) => setPassword(target.value)}
						required/>
					</li>
				</ul>
				</fieldset>
				<Button variant='outlined' color='success' type="submit">Sign Up</Button>
				<Button variant='outlined' color='success' onClick={ () => setCurrentView("logIn")}>Have an Account?</Button>
			</form>
			)
			break
		case "logIn":
			return (
			<form onSubmit={handleLoginFormSubitted}>
				<h2>Welcome Back!</h2>

				<fieldset>
				<legend>Log In</legend>
				<ul>
					<li>
					<label htmlFor="username">Username:</label>
					<input 
						type="text" 
						id="username" 
						placeholder='Username'
						onChange={({target}) => setUsername(target.value)}
						required/>
					</li>
					<li>
					<label htmlFor="password">Password:</label>
					<input 
						type="password" 
						id="password" 
						placeholder='Password'
						onChange={({target}) => setPassword(target.value)}
						required/>
					</li>
					{/* <li>
					<i/>
					<a onClick={ () => this.changeView("PWReset")} href="#">Forgot Password?</a>
					</li> */}
				</ul>
				</fieldset>
				<Button variant='outlined' color='primary' type='submit'>Login</Button>
				<Button variant='outlined' color='primary' onClick={ () => setCurrentView("signUp")}>Create an Account</Button>
			</form>
			)
			break
		//   case "PWReset":
		//     return (
		//       <form>
		//       <h2>Reset Password</h2>
		//       <fieldset>
		//         <legend>Password Reset</legend>
		//         <ul>
		//           <li>
		//             <em>A reset link will be sent to your inbox!</em>
		//           </li>
		//           <li>
		//             <label for="email">Email:</label>
		//             <input type="email" id="email" required/>
		//           </li>
		//         </ul>
		//       </fieldset>
		//       <button>Send Reset Link</button>
		//       <button type="button" onClick={ () => this.changeView("logIn")}>Go Back</button>
		//     </form>
		//     )
		default:
			break
		}
	}



	return (
	<section id="entry-page">
			<Snackbar 
			open={errorType==='login_error' || errorType==='register_error'} autoHideDuration={6000} onClose={handleSnackBarClose}>
			<Alert onClose={handleSnackBarClose} 
				severity="error" 
				sx={{ width: '100%' }}>
			{errorType==='login_error' ? loginErrMsg : registerErrMsg}
			</Alert>
			</Snackbar>

			<Snackbar 
			open={errorType==='login_success' || errorType==='register_success'} autoHideDuration={6000} onClose={handleSnackBarClose}>
			<Alert onClose={handleSnackBarClose} 
				severity="success" 
				sx={{ width: '100%' }}>
			{errorType==='login_success' ? LOGIN_SUCCESS : REGISTER_SUCCESS}
			</Alert>
			</Snackbar>

			{renderCurrentView()}
		</section>
	)
}
	

