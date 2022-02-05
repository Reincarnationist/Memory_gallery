import React from 'react'
import { Redirect } from 'react-router-dom'
import '../../static/css/authentication.css'
export default class Authentication extends React.Component {
	// Note: the comment sections in this page is reserved for future scale
	constructor(props){
		super(props)
		this.state = {
		currentView: "signUp",
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
	async handleLoginFormSubitted(){

	}
	async handleRegisterFormSubitted(e){
		e.preventDefault()
		fetch("/auth/csrf/")
			.then(res => res.json())
			.then(res => {
				
				const requestOptions = {
					credentials: "include",
					method: "POST",
					mode: 'same-origin',
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
						.then(response => {
							if (response.ok){
								this.setState({
									successMsg: `Successfully registered! Welcome ${this.state.username}`
								})
								return response.json()

							}else{
								throw new Error('The registration process failed, please try again.');
							}})
						.then((data) => {
							sessionStorage.setItem('username', data.user.username)
							this.props.history.push("/account/" + data.user.username)
						})
						.catch(error => {
							console.log('failed ' + error) 
							this.setState({
								errorMsg: error
							})
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
				<button type="submit">Register</button>
				<button type="button" onClick={ () => this.changeView("logIn")}>Have an Account?</button>
			</form>
			)
			break
		case "logIn":
			return (
			<form onSubmit={this.handleLoginFormSubitted}>
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
				<button type='submit'>Login</button>
				<button type="button" onClick={ () => this.changeView("signUp")}>Create an Account</button>
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

