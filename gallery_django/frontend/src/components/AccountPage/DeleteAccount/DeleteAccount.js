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

export default function DeleteAccount() {

  const [open, setOpen] = React.useState(false);
  const [errorType, setErrorType] = React.useState('');
  const [deleteErrMsg, setDeleteErrMsg] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const CONFIRM = 'Delete My Account'
  const CONFRIM_ERROR_MESSAGE = "Please type the confirm correctly"
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

    fetch("/auth/csrf/")
        .then(res => res.json())
        .then(res => {
            return fetch("/auth/delete-user/", {
              method: "DELETE",
              headers: { 
                'X-CSRFToken': res.csrfToken
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
                .then((data) => {
                    sessionStorage.removeItem('username')
                    setTimeout(() => history.push("/"), 3000);
                    
                })
                .catch(error =>{
                    null
                })
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
          {CONFRIM_ERROR_MESSAGE}
        </Alert></Snackbar>

		<Snackbar open={errorType==='delete_error_error'} autoHideDuration={6000} onClose={handleSnackBarClose}>
        <Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
          {deleteErrMsg}
        </Alert></Snackbar>

        <Snackbar open={errorType==='delete_success'} autoHideDuration={6000} onClose={handleSnackBarClose}>
        <Alert onClose={handleSnackBarClose} severity="success" sx={{ width: '100%' }}>
          {DELETE_SUCCESS_MESSAGE}
        </Alert></Snackbar>
        
      <Button variant="outlined" onClick={handleClickOpen}>
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
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}