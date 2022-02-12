//This template is from Material-ui FormDialog Api
import * as React from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import MultilineEdit from './MultilineInlineEdit';
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

export default function ChangePassword() {

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
    fetch("/auth/csrf/")
        .then(res => res.json())
        .then(res => {
			const requestOptions = {
				method: "PUT",
				headers: { 
					"Content-Type": "application/json",
					'X-CSRFToken': res.csrfToken
						},
				body: JSON.stringify({
					old_password: old_password,
					new_password1: new_password1,
					new_password2: new_password2,
				}),
				};
            return fetch("/auth/change-password/", requestOptions)
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
                .then((data) => {
					//nothing needs to be done after password change, the user will remain logged in
					null  
                })
                .catch(error =>{
                    null
                })
        })
    
}
  return (
	<MultilineEdit value={'test'} setValue={()=>{}} />
  );
}