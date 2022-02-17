import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
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
		Card,
		CardActions,
		CardContent,
		CardMedia  } from '@mui/material';

import { useParams } from 'react-router-dom';
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function AlbumDetail( {csrf_token} ) {
	const params = useParams()
	const username_param = params.username
	const album_id = params.album_id

	const [album_title, setAlbum_title] = React.useState('');
	const [isOwner, setIsOwner] = React.useState(false);
	const [current_photo_id, setCurrent_photo_id] = React.useState('');
	const [delete_dialog_open, setDelete_dialog_open] = React.useState(false);

	const [photos, setPhotos] = React.useState([])
	const [not_found, setNot_found] = React.useState(false)

	const [errorType, setErrorType] = React.useState('');
	const [getPhotosErrMsg, setGetPhotosErrMsg] = React.useState('');
	const [uploadPhotoErrMsg, setUploadPhotoErrMsg] = React.useState('');
	const [deletePhotoErrMsg, setDeletePhotoErrMsg] = React.useState('');
	const [likePhotoErrMsg, setLikePhotoErrMsg] = React.useState('');
	const [commentPhotoErrMsg, setCommentPhotoErrMsg] = React.useState('');
	const NOT_FOUND_MESSAGE = 'Sorry, there is no photos in this album at the moment.'

	React.useEffect(() => {
		const logged_in_user = sessionStorage.getItem('username')
		if (logged_in_user){
			if (logged_in_user === username_param){
				setIsOwner(true)
			}
		}

		fetch('/api/get-photo-from-album' + '?album_id=' + album_id, {method: 'GET'})
			.then(res => {
				if (res.ok){
					return res.json()
				}else if(res.status === 404){
					setNot_found(true)
					throw new Error('No photo found')
				}else{
					return res.text().then(text => {
						setErrorType('get_photos_error')
						setGetPhotosErrMsg(String(text).substring(1,String(text).length - 1))
						throw new Error('Get albums failed')
					})
				}
			})
			.then(data => {
				setPhotos(data)
				album_title === '' ? setAlbum_title(data[0].belong_to) : null
			})
			.catch(error => console.log(error))

	}, []);
	

	const handleDelete_Dialog_Close = () => {
		setDelete_dialog_open(false)
	}

	const handleSnackBarClose = (event, reason) => {
		if (reason === 'clickaway') {
		return;
		}
		setErrorType('');
	};

	const handleUploadPhoto = async e =>{
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


	const handleDeletePhoto = async e =>{
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
					errorType === 'get_photos_error' || 
					errorType === 'upload_photos_error' ||
					errorType === 'delete_photo_error' ||
					errorType === 'like_photo_error' ||
					errorType === 'comment_photo_error'
				} 
				autoHideDuration={6000} 
				onClose={handleSnackBarClose}>

				<Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
				{errorType === 'get_photos_error' && getPhotosErrMsg}
				{errorType === 'upload_photos_error' && uploadPhotoErrMsg}
				{errorType === 'delete_photo_error' && deletePhotoErrMsg}
				{errorType === 'like_photo_error' && likePhotoErrMsg}
				{errorType === 'comment_photo_error' && commentPhotoErrMsg}
				</Alert>
			</Snackbar>

			<Snackbar 
				open={
					errorType === 'upload_photos_success' || 
					errorType === 'delete_photo_success' ||
					errorType === 'comment_photo_success'
				} 
				autoHideDuration={6000} 
				onClose={handleSnackBarClose}>

				<Alert onClose={handleSnackBarClose} severity="success" sx={{ width: '100%' }}>
				{errorType === 'upload_photos_success' && 'Photos uploaded successfully'}
				{errorType === 'delete_photo_success' && 'Photo deleted successfully'}
				{errorType === 'comment_photo_success' && 'comment post successfully'}
				</Alert>
			</Snackbar>

			
			{/* Delete Photo form dialog*/}
			<Dialog open={delete_dialog_open} onClose={handleDelete_Dialog_Close}>
				<DialogTitle>
					Delete Photo
					</DialogTitle>
				<DialogContent>
				<DialogContentText>
					This action cannot be undo, are you sure you want to delete the photo?		
				</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDelete_Dialog_Close}>Cancel</Button>
					<Button onClick={handleDeletePhoto} color='error'>
					Delete
					</Button>
				</DialogActions>
			</Dialog>


			<Grid item xs={isOwner? 8:12}>
				<Typography variant="h3" component="div" style={{color: '#34568B'}}>
					You can broswer all the photos in {album_title} now! 
					</Typography>
				<Typography variant="h4" component="h4">
					Like or leave a comment if you see some interesting/beautiful photos.
					</Typography>
			</Grid>
			{isOwner &&
				<Grid item xs={4} align='right'>
				<Button 
					variant="contained" 
					color='primary'
					onClick={handleUploadPhoto}
					>Upload Photos</Button>
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
					photos.map((item, index) => (
						<Grid item xs={3} key={index}>
							<Card sx={{ 
									maxWidth: 300, 
									maxHeight: 350,
									display: 'flex', 
									justifyContent: 'space-between', 
									flexDirection: 'column' }}>
								<CardMedia
									component="img"
									alt={`photo of ${album_id}`}
									height="300"
									image={item.thumb}
									// style={{width: 250, height: 250, objectFit: 'cover'}}
								/>
								<CardContent>
									<Typography variant="body2" color="text.secondary">
										{/* django datetime field:  2022-02-04T01:03:39.531386-05:00*/}
									Create At: {item.create_at.slice(0, item.create_at.indexOf('T'))}
									</Typography>
								</CardContent>
								<CardActions>
									{isOwner && 
									<Button 
										variant='contained' 
										size="small" 
										color='error'
										onClick={() =>{
											setDelete_dialog_open(true); 
											setCurrent_photo_id(item.unique_id);
										}}>Delete</Button>}
								</CardActions>
							</Card>
						</Grid>
					))
				
			}
			
		</Grid>
	);
	}