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
  const [confirmErr, setConfirmErr] = React.useState(false);
  const [deleteErr, setDeleteErr] = React.useState(false);
  const [deleteErrMsg, setDeleteErrMsg] = React.useState('');
  const [deleteSucc, setDeleteSucc] = React.useState(false);
  const [confirm, setConfirm] = React.useState('');
  const CONFIRM = 'Delete My Account'
  const history = useHistory();


  const handleConfirmBarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setConfirmErr(false);
  };
  const handleDeleteErrBarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setDeleteErr(false);
  };
  const handleDeleteSuccBarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setDeleteSucc(false);
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
        setConfirmErr(true);
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
                        setDeleteSucc(true)
                    }else{
                        //Warning:
                        //Do not raise a new error here then deal with it in the catch
                        //technically you can do this but you won't be able to set errorMsg
                        //as the error is not serializable like normal objects
                        //see this 
                        //https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
                        

                        return res.text().then(text => {
                            setDeleteErr(true)
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
        {confirmErr && (
        <Snackbar open={confirmErr} autoHideDuration={6000} onClose={handleConfirmBarClose}>
        <Alert onClose={handleConfirmBarClose} severity="error" sx={{ width: '100%' }}>
          Please type the confirm correctly
        </Alert></Snackbar>)
        }
        {deleteErr && (
        <Snackbar open={deleteErr} autoHideDuration={6000} onClose={handleDeleteErrBarClose}>
        <Alert onClose={handleDeleteErrBarClose} severity="error" sx={{ width: '100%' }}>
            {deleteErrMsg}
        </Alert></Snackbar>)
        }
        {deleteSucc && (
        <Snackbar open={deleteSucc} autoHideDuration={6000} onClose={handleDeleteSuccBarClose}>
        <Alert onClose={handleDeleteSuccBarClose} severity="success" sx={{ width: '100%' }}>
          Delete Successfully!
        </Alert></Snackbar>)
        }
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