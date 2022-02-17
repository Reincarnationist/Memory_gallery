import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import empty from '../../../static/images/No_image_available.svg.png'
import { 
		Grid,
		Typography,
		Button,
		TextField,
		Dialog,
		DialogActions,
		DialogContent,
		DialogContentText,
		DialogTitle,
		Radio,
		RadioGroup,
		FormControlLabel,
		Card,
		CardActions,
		CardContent,
		CardMedia  } from '@mui/material';

import { useParams } from 'react-router-dom';
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Collection( {csrf_token} ) {
	const params = useParams()
	const username_param = params.username

	const [isOwner, setIsOwner] = React.useState(false);
	const [open, setOpen] = React.useState(false);
	const [title, setTitle] = React.useState('New Album');
	const [description, setDescription] = React.useState('');
	const [isPublic, setIsPublic] = React.useState(true);
	const [album_editing_status, setAlbum_editing_status] = React.useState('');
	const [current_album_id, setCurrent_album_id] = React.useState('');
	const [delete_dialog_open, setDelete_dialog_open] = React.useState(false);

	const [albums, setAlbums] = React.useState([])
	const [not_found, setNot_found] = React.useState(false)

	const [errorType, setErrorType] = React.useState('');
	const [createAlbumErrMsg, setCreateAlbumErrMsg] = React.useState('');
	const [updateAlbumErrMsg, setUpdateAlbumErrMsg] = React.useState('');
	const [deleteAlbumErrMsg, setDeleteAlbumErrMsg] = React.useState('');
	const NOT_FOUND_MESSAGE = 'Sorry, there is no available albums at the moment or the user does not exist.'

	React.useEffect(() => {
		const logged_in_user = sessionStorage.getItem('username')
		if (logged_in_user){
			if (logged_in_user === username_param){
				setIsOwner(true)

				fetch('/api/get-my-albums/', {method: 'GET'})
					.then(res => {
						if (res.ok){
							return res.json()
						}else if ( res.status === 404){
							// 404
							setNot_found(true)
							throw new Error('no album found') 
						}else{
							throw new Error('unknown error') 
						}
					})
					.then(data => {
						console.log(data)
						for (let i = 0; i < data.length; i++){
							if (data[i].photos.length === 0){
								data[i].photos.push(empty)
							}
						}
						setAlbums(data)
						})
					.catch(error => console.log(error))
				return
			}
		}

		// non-login users and non-owner users
		fetch('/api/get-user-public-albums/' + '?username=' + username_param, {method: "GET"})
			.then(res => {
				if (res.ok){
					return res.json()
				}else{
					// 404
					setNot_found(true)
					throw new Error('no album found or user not found') 
				}
			})
			.then(data => setAlbums(data))
			.catch(error => console.log(error))
	}, []);
	
	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleDelete_Dialog_Close = () => {
		setDelete_dialog_open(false)
	}

	const handleRadioChange = (event) => {
		setIsPublic(event.target.value === 'public' ? true: false);
	};

	const handleSnackBarClose = (event, reason) => {
		if (reason === 'clickaway') {
		return;
		}
		setErrorType('');
	};

	const handleCreateAlbum = async e =>{
		e.preventDefault()
		const requestOptions = {
			method: "POST",
			headers: { 
				"Content-Type": "application/json",
				'X-CSRFToken': csrf_token
					},
			body: JSON.stringify({
				title: title,
				description: description,
				public: isPublic,
			}),
		};
		fetch("/api/create-album/", requestOptions)
			.then(res => {
				if (res.ok){
					setErrorType('create_album_success')
					setOpen(false)
				}else{                        
					return res.text().then(text => {
						setOpen(false)
						setErrorType('create_album_error')
						setCreateAlbumErrMsg(String(text).substring(1,String(text).length - 1))
						throw new Error('Create Album failed')
					})
				}})
			.catch(error =>{
				console.log(error)
			})
		
	}

	const handleUpdateAlbum = async e =>{
		e.preventDefault()
		const requestOptions = {
			method: "PATCH",
			headers: { 
				"Content-Type": "application/json",
				'X-CSRFToken': csrf_token
					},
			body: JSON.stringify({
				title: title,
				description: description,
				public: isPublic,
			}),
		};
		if (current_album_id === ''){
			console.log('album_id is empty.')
			setErrorType('update_album_error')
			return
		}
		fetch("/api/update-album" + '?album_id=' + current_album_id, requestOptions)
			.then(res => {
				if (res.ok){
					setErrorType('update_album_success')
					setOpen(false)
				}else{                        
					return res.text().then(text => {
						setOpen(false)
						setErrorType('update_album_error')
						setUpdateAlbumErrMsg(String(text).substring(1,String(text).length - 1))
						throw new Error('Update Album failed')
					})
				}})
			.catch(error =>{
				console.log(error)
			})
		
	}

	const handleDeleteAlbum = async e =>{
		e.preventDefault()
		const requestOptions = {
			method: "DELETE",
			headers: { 
				'X-CSRFToken': csrf_token
			},
		};

		if (current_album_id === ''){
			console.log('album_id is empty.')
			setErrorType('delete_album_error')
			return
		}

		fetch("/api/delete-album" + '?album_id=' + current_album_id, requestOptions)
			.then(res => {
				if (res.ok){
					setErrorType('delete_album_success')
					setDelete_dialog_open(false)
				}else{                        
					return res.text().then(text => {
						setDelete_dialog_open(false)
						setErrorType('delete_album_error')
						setDeleteAlbumErrMsg(String(text).substring(1,String(text).length - 1))
						throw new Error('Delete Album failed')
					})
				}})
			.catch(error =>{
				console.log(error)
			})
		
	}
	return (
		<Grid container spacing={2} style={{flex: 1, width: '80%', margin: 'auto'}} >
			<Snackbar 
				open={
					errorType === 'create_album_error' || 
					errorType === 'update_album_error' ||
					errorType === 'delete_album_error' } 
				autoHideDuration={6000} 
				onClose={handleSnackBarClose}>

				<Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
				{errorType === 'create_album_error' && createAlbumErrMsg}
				{errorType === 'update_album_error' && updateAlbumErrMsg}
				{errorType === 'delete_album_error' && deleteAlbumErrMsg}
				</Alert>
			</Snackbar>

			<Snackbar 
				open={
					errorType === 'create_album_success' || 
					errorType === 'update_album_success' ||
					errorType === 'delete_album_success' } 
				autoHideDuration={6000} 
				onClose={handleSnackBarClose}>

				<Alert onClose={handleSnackBarClose} severity="success" sx={{ width: '100%' }}>
				{errorType === 'create_album_success' && 'Album created successfully'}
				{errorType === 'update_album_success' && 'Album updated successfully'}
				{errorType === 'delete_album_success' && 'Album deleted successfully'}
				</Alert>
			</Snackbar>

			{/* Create Album form dialog*/}
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>
					{album_editing_status === 'create' ? "Create An Album" : "Update the Album"}
					</DialogTitle>
				<DialogContent>
				<DialogContentText>
					
					{album_editing_status === 'create' ? 
					`To create an album, please enter your the title and description. 
					You can either set it as a public album or a private album. 
					Of course, these are free to be changed afterwards. \n
					Note: You can't have two albums with same name, 
					and description must be less than 100 characters.`
					:
					`Updating the album. 
					Note: You can't have two albums with same name, 
					and description must be less than 100 characters.`}
					
				</DialogContentText>
				<TextField
					autoFocus
					margin="dense"
					id="name"
					label="title"
					type="text"
					fullWidth
					variant="standard"
					value={title}
					onChange={({target}) => setTitle(target.value)}
				/>
				<TextField
					margin="dense"
					id="name"
					label="description"
					type="text"
					fullWidth
					variant="standard"
					value={description}
					onChange={({target}) => setDescription(target.value)}
				/>
				<RadioGroup
					aria-labelledby="public-radio-buttons-group"
					name="controlled-radio-buttons-group"
					value={isPublic ? 'public' : 'private'}
					onChange={handleRadioChange}
				>
					<FormControlLabel value="public" control={<Radio />} label="Public" />
					<FormControlLabel value="private" control={<Radio />} label="Private" />
				</RadioGroup>

				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={album_editing_status==='create'?handleCreateAlbum:handleUpdateAlbum}>
					{album_editing_status==='create'?'Create':'Update'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Album form dialog*/}
			<Dialog open={delete_dialog_open} onClose={handleDelete_Dialog_Close}>
				<DialogTitle>
					Delete Album
					</DialogTitle>
				<DialogContent>
				<DialogContentText>
					This action cannot be undo, are you sure you want to delete the album?		
				</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDelete_Dialog_Close}>Cancel</Button>
					<Button onClick={handleDeleteAlbum} color='error'>
					Delete
					</Button>
				</DialogActions>
			</Dialog>


			<Grid item xs={isOwner? 8:12}>
				<Typography variant="h3" component="div" style={{color: '#34568B'}}>
					Welcome to {username_param}'s space! 
					</Typography>
				<Typography variant="h4" component="h4">
					Below are his/her albums, check them out!
					</Typography>
			</Grid>
			{isOwner &&
				<Grid item xs={4} align='right'>
				<Button 
					variant="contained" 
					color='primary'
					onClick={() => {
						setOpen(true); 
						setAlbum_editing_status('create');
						// below is for the case the user clicks the update button then close them
						// need to reset the value
						setTitle('New Album');
						setDescription('');
						setIsPublic(true);
						}}
					>Create An Album</Button>
				</Grid>
			}
			
			{not_found ? 
				(
				<Grid item xs={12}>
					<Typography variant="h2" component="div">
						{NOT_FOUND_MESSAGE}
					</Typography>
				</Grid>	)
				:
					albums.map((item, index) => (
						<Grid item xs={3} key={index}>
							<Card sx={{ 
									maxWidth: 250, 
									height: '100%',
									display: 'flex', 
									justifyContent: 'space-between', 
									flexDirection: 'column' }}>
								<CardMedia
									component="img"
									alt={item.title}
									height="250"
									image={`${item.photos[0].slice(item.photos[0].indexOf(':') + 1)}`}
									// style={{width: 250, height: 250, objectFit: 'cover'}}
								/>
								<CardContent>
									<Typography gutterBottom variant="h5" component="div">
									{item.title}
									</Typography>
									<Typography variant="body2" color="text.secondary">
									description: {
									item.description===null?
									'The user did not write anything about this album':
									item.description}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{/* django datetime field:  2022-02-04T01:03:39.531386-05:00*/}
									Create At: {item.create_at.slice(0, item.create_at.indexOf('T'))}
									</Typography>
								</CardContent>
								<CardActions>
									
									<Button 
										variant='contained' 
										size="small"
										>Explore</Button>
									{isOwner && 
									<Button 
										variant='contained' 
										size="small"
										onClick={() => {
											setOpen(true); 
											setAlbum_editing_status('update');
											setCurrent_album_id(item.unique_id);
											setTitle(item.title);
											setDescription(item.description);
											setIsPublic(item.public);
											}}>Update</Button>}
									{isOwner && 
									<Button 
										variant='contained' 
										size="small" 
										color='error'
										onClick={() =>{
											setDelete_dialog_open(true); 
											setCurrent_album_id(item.unique_id);
										}}>Delete</Button>}
								</CardActions>
							</Card>
						</Grid>
					))
				
			}
			
		</Grid>
	);
	}