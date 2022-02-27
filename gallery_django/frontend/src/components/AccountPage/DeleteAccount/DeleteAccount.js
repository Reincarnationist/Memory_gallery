//This template is from Material-ui FormDialog Api
import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useHistory } from "react-router-dom";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

export default function DeleteAccount( {csrf_token} ) {

  const [open, setOpen] = React.useState(false);
  const [errorType, setErrorType] = React.useState('');
  const [deleteErrMsg, setDeleteErrMsg] = React.useState('');
  const [confirm, setConfirm] = React.useState('');

  const CONFIRM = 'Delete My Account'
  const CONFIRM_ERROR_MESSAGE = "Please type the confirm correctly"
  const DELETE_SUCCESS_MESSAGE = "Delete Successfully!"
  const history = useHistory();


  const handleSnackBarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrorType('');
  };


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleDelete = async e =>{
    e.preventDefault()
    if (confirm !== CONFIRM){
        setConfirm('')
        setErrorType('confirm_error');
    }else{

    // Known issue here, after the user deletes his account, the header will remain 'setting/logout'
	// that's because the header's authentication state is local
	// In order to solve this problem we need to move authentication to props and pass it down to both
	// header and deleteAccount component so that then a user deletes his account the header knows
	// he is not authenticated anymore. I'll leave it as it because it is not that critical.
	// The current solution is force refresh the page after successfully delete which is not recommanded
	fetch("/auth/delete-user/", {
		method: "DELETE",
		headers: { 
		'X-CSRFToken': csrf_token,
		'mode': 'same-origin'
			},})
		.then(res => {
			if (res.ok){
				setErrorType('delete_success')
			}else{
				//Warning:
				//Do not raise a new error here then deal with it in the catch
				//technically you can do this but you won't be able to set errorMsg
				//as the error is not serializable like normal objects
				//see this 
				//https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
				

				return res.text().then(text => {
					setErrorType('delete_error')
					setDeleteErrMsg(String(text).substring(1,String(text).length - 1))
					throw new Error('Delete failed')
				})

				// this.setState({
				// 	errorMsg: 'Error Code: ' + res.status + ': ' + 'The login process failed, please try again.'
				// })
			}})
		.then(() => {
			sessionStorage.removeItem('username')
			setTimeout(() => window.location.reload(), 3000);
		})
		.catch(error =>{
			console.log(error)
		})

    }
}
  return (
    <div>
		{/* This seems stupid to have three similar elements here but they are essential.
			Without indivial snackbar you will see a 0.5s error bar showing up after the 
			successful bar gets closed, vice versa. 
			Note: this can be fixed by adding one more state for opening/closing, leave it for later*/}
        <Snackbar open={errorType==='confirm_error'} autoHideDuration={6000} onClose={handleSnackBarClose}>
        <Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
          {CONFIRM_ERROR_MESSAGE}
        </Alert></Snackbar>

		<Snackbar open={errorType==='delete_error_error'} autoHideDuration={6000} onClose={handleSnackBarClose}>
        <Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
          {deleteErrMsg}
        </Alert></Snackbar>

        <Snackbar open={errorType==='delete_success'} autoHideDuration={6000} onClose={handleSnackBarClose}>
        <Alert onClose={handleSnackBarClose} severity="success" sx={{ width: '100%' }}>
          {DELETE_SUCCESS_MESSAGE}
        </Alert></Snackbar>
		
        <br />
      <Button variant='contained' color='error' onClick={handleClickOpen}>
        Delete My Account
      </Button>
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To delete the account, please type <em>Delete My Account</em>.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Confirm"
            type="text"
            fullWidth
            variant="standard"
            onChange={ ({target}) => setConfirm(target.value) }
          />
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={handleCancel}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}