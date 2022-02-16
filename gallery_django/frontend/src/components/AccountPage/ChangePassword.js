//This template is from Material-ui FormDialog Api
import * as React from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import '../../../static/css/changepassword.css'
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

export default function ChangePassword( {csrf_token} ) {

  const [errorType, setErrorType] = React.useState('');
  const [pwChangeErrMsg, setPwChangeErrMsg] = React.useState('');
  const [old_password, setOld_password] = React.useState('');
  const [new_password1, setNew_password1] = React.useState('');
  const [new_password2, setNew_password2] = React.useState('');
  const PWCHANGE_SUCCESS_MESSAGE = "Password changed Successfully! You do not need to log in again."


  const handleSnackBarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrorType('');
  };

  const handlePwChange = async e =>{
    e.preventDefault()
	if (new_password1 !== new_password2){
		setErrorType('pw_not_match')
		return
	}

	const requestOptions = {
		method: "PUT",
		headers: { 
			"Content-Type": "application/json",
			'X-CSRFToken': csrf_token,
			'mode': 'same-origin'
				},
		body: JSON.stringify({
			old_password: old_password,
			new_password1: new_password1,
			new_password2: new_password2,
		}),
		};
	fetch("/auth/change-password/", requestOptions)
		.then(res => {
			if (res.ok){
				setErrorType('pwchange_success')
			}else{                        
				return res.text().then(text => {
					setErrorType('pwchange_error')
					setPwChangeErrMsg(String(text).substring(1,String(text).length - 1))
					throw new Error('pwchange failed')
				})
			}})
		.catch(error =>{
			console.log(error)
		})
        
    
}
  return (
	<section id="entry-page">
		<Snackbar open={errorType==='pwchange_error'} autoHideDuration={6000} onClose={handleSnackBarClose}>
			<Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
			{pwChangeErrMsg}
			</Alert></Snackbar>

			<Snackbar open={errorType==='pwchange_success'} autoHideDuration={6000} onClose={handleSnackBarClose}>
			<Alert onClose={handleSnackBarClose} severity="success" sx={{ width: '100%' }}>
			{PWCHANGE_SUCCESS_MESSAGE}
			</Alert></Snackbar>

			<Snackbar open={errorType==='pw_not_match'} autoHideDuration={6000} onClose={handleSnackBarClose}>
			<Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
			New passwords must match
			</Alert></Snackbar>
		<form onSubmit={handlePwChange}>
			<h2>Change Password</h2>

			<fieldset>
			<legend>Change Password</legend>
			<ul>
				<li>
				<label htmlFor="old_password">Old Password:</label>
				<input 
					type="password" 
					id="old_password" 
					placeholder='Old Password'
					onChange={({target}) => setOld_password(target.value)}
					required/>
				</li>
				{/* <li>
				<label for="email">Email:</label>
				<input type="email" id="email" required/>
				</li> */}
				<li>
				<label htmlFor="new_password1">New Password:</label>
				<input 
					type="password" 
					id="new_password1" 
					placeholder='New Password'
					onChange={({target}) => setNew_password1(target.value)}
					required/>
				</li>
				<li>
				<label htmlFor="new_password2">Confirm Password:</label>
				<input 
					type="password" 
					id="new_password2" 
					placeholder='Confirm Password'
					onChange={({target}) => setNew_password2(target.value)}
					required/>
				</li>
			</ul>
			</fieldset>
			<Button variant='outlined' color='success' type="submit">Submit</Button>
		</form>
	</section>
	
  );
}