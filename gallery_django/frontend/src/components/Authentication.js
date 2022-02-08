import React from 'react'
import { Redirect } from 'react-router-dom'
import '../../static/css/authentication.css'
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';

export default class Authentication extends React.Component {
	// Note: the comment sections in this page is reserved for future scale
	constructor(props){
		super(props) 

		this.state = {
		currentView: "logIn",
		username: '',
		password: '',
		Authenticated_username: '',
		errorMsg: '',
		successMsg: '',
		
		}

		this.handleUsernameFieldChange = this.handleUsernameFieldChange.bind(this)
		this.handlePasswordFieldChange = this.handlePasswordFieldChange.bind(this)
		this.handleLoginFormSubitted = this.handleLoginFormSubitted.bind(this)
		this.handleRegisterFormSubitted = this.handleRegisterFormSubitted.bind(this)
	}

	componentDidMount() {
			const logged_in_user = sessionStorage.getItem('username')
			if (logged_in_user){
				this.setState({
					Authenticated_username: logged_in_user
				})
			}
		}


	handleUsernameFieldChange(e) {
		this.setState({
		  username: e.target.value,
		});
	  }
	handlePasswordFieldChange(e) {
		this.setState({
		  password: e.target.value,
		});
	  }
	async handleLoginFormSubitted(e){
		e.preventDefault()
		fetch("/auth/csrf/")
			.then(res => res.json())
			.then(res => {
				
				const requestOptions = {
					credentials: "include",
					method: "POST",
					headers: { 
						"Content-Type": "application/json",
						'X-CSRFToken': res.csrfToken
							},
					body: JSON.stringify({
						username: this.state.username,
						password: this.state.password,
					}),
					};
				return fetch("/auth/login/", requestOptions)
					.then(res => {
						if (res.ok){
							this.setState({
								successMsg: `Successfully login! Welcome ${this.state.username}`
							})
							return res.json()

						}else{
							//Warning:
							//Do not raise a new error here then deal with it in the catch
							//technically you can do this but you won't be able to set errorMsg
							//as the error is not serializable like normal objects
							//see this 
							//https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
							

							return res.text().then(text => {

								this.setState({
									errorMsg: String(text).substring(1,String(text).length - 1)
								})
								throw new Error('Login failed')
							})

							// this.setState({
							// 	errorMsg: 'Error Code: ' + res.status + ': ' + 'The login process failed, please try again.'
							// })
							
						}})
					.then((data) => {
						sessionStorage.setItem('username', data.user.username)
						this.props.history.push("/account/" + data.user.username)
					})
					.catch(error =>{
						null
					})
			})
	}
	async handleRegisterFormSubitted(e){
		e.preventDefault()
		fetch("/auth/csrf/")
			.then(res => res.json())
			.then(res => {
				
				const requestOptions = {
					credentials: "include",
					method: "POST",
					headers: { 
						"Content-Type": "application/json",
						'X-CSRFToken': res.csrfToken
							},
					body: JSON.stringify({
						username: this.state.username,
						password: this.state.password,
					}),
					};
				return fetch("/auth/register/", requestOptions)
					.then(res => {
						if (res.ok){
							this.setState({
								successMsg: `Successfully registered! Welcome ${this.state.username}`
							})
							return res.json()

						}else{
							//Warning:
							//Do not raise a new error here then deal with it in the catch
							//technically you can do this but you won't be able to set errorMsg
							//as the error is not serializable like normal objects
							//see this 
							//https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
							

							return res.text().then(text => {

								this.setState({
									errorMsg: String(text).substring(1,String(text).length - 1)
								})
								throw new Error('Registration failed')
							})

							// this.setState({
							// 	errorMsg: 'Error Code: ' + res.status + ': ' + 'The registration process failed, please try again.'
							// })
							
						}})
					.then((data) => {
						sessionStorage.setItem('username', data.user.username)
						this.props.history.push("/account/" + data.user.username)
					})
					.catch(error =>{
						null
					})
			})

		}
	

	
	changeView = (view) => {
		this.setState({
		currentView: view
		})
	}

	currentView = () => {
		switch(this.state.currentView) {
		case "signUp":
			return (
			<form onSubmit={this.handleRegisterFormSubitted}>
				<h2>Sign Up!</h2>

				<Collapse in={this.state.errorMsg != ''}>
					<Alert
					variant='filled'
					severity='error'
					action={
						<IconButton
						aria-label="close"
						color="error"
						size="small"
						onClick={() => {
							this.setState({
								errorMsg: ''
							})
						}}
						>
						<CloseIcon fontSize="inherit" />
						</IconButton>
					}
					>
					{this.state.errorMsg}
					</Alert>
				</Collapse>
			
				
				<fieldset>
				<legend>Create Account</legend>
				<ul>
					<li>
					<label htmlFor="username">Username:</label>
					<input 
						type="text" 
						id="username" 
						placeholder='Username'
						onChange={this.handleUsernameFieldChange}
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
						onChange={this.handlePasswordFieldChange}
						required/>
					</li>
				</ul>
				</fieldset>
				<Button variant='outlined' color='success' type="submit">Sign Up</Button>
				<Button variant='outlined' color='success' onClick={ () => this.changeView("logIn")}>Have an Account?</Button>
			</form>
			)
			break
		case "logIn":
			return (
			<form onSubmit={this.handleLoginFormSubitted}>
				<h2>Welcome Back!</h2>

				<Collapse in={this.state.errorMsg != ''}>
					<Alert
					variant='filled'
					severity='error'
					action={
						<IconButton
						aria-label="close"
						color="error"
						size="small"
						onClick={() => {
							this.setState({
								errorMsg: ''
							})
						}}
						>
						<CloseIcon fontSize="inherit" />
						</IconButton>
					}
					>
					{this.state.errorMsg}
					</Alert>
				</Collapse>

				<fieldset>
				<legend>Log In</legend>
				<ul>
					<li>
					<label htmlFor="username">Username:</label>
					<input 
						type="text" 
						id="username" 
						placeholder='Username'
						onChange={this.handleUsernameFieldChange}
						required/>
					</li>
					<li>
					<label htmlFor="password">Password:</label>
					<input 
						type="password" 
						id="password" 
						placeholder='Password'
						onChange={this.handlePasswordFieldChange}
						required/>
					</li>
					{/* <li>
					<i/>
					<a onClick={ () => this.changeView("PWReset")} href="#">Forgot Password?</a>
					</li> */}
				</ul>
				</fieldset>
				<Button variant='outlined' color='primary' type='submit'>Login</Button>
				<Button variant='outlined' color='primary' onClick={ () => this.changeView("signUp")}>Create an Account</Button>
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


	render() {
		let Authenticated_username = this.state.Authenticated_username

		return (Authenticated_username ?
			<Redirect to={`/account/${Authenticated_username}`} />
		:
		<section id="entry-page">
				{this.currentView()}
			</section>

		)
	}
	}

