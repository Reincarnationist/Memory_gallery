// The basic idea is from 'react-simple-image-viewer'
import * as React from 'react';
import '../../../static/css/imageviewer.css'

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ImageViewer(props) {
	const [currentIndex, setCurrentIndex] = React.useState(props.currentIndex ?? 0);
	const [liked, setLiked] = React.useState(false);
	const [comments, setComments] = React.useState([]);

	const [errorType, setErrorType] = React.useState('');
	const [getPhotoErrMsg, setGetPhotoErrMsg] = React.useState('');
	const [likePhotoErrMsg, setLikePhotoErrMsg] = React.useState('');
	const [getPhotoCommentErrMsg, setGetPhotoCommentErrMsg] = React.useState('');
	const [commentPhotoErrMsg, setCommentPhotoErrMsg] = React.useState('');
	const [deleteCommentErrMsg, setDeleteCommentErrMsg] = React.useState('');

	const [open_comment, setOpen_comment] = React.useState(false)
	const [comment_to_post, setComment_to_post] = React.useState('')
	const [state_for_reload, setState_for_reload] = React.useState(0)

	const OWNER_LIKE_PHOTO = "You can't like your own photos"
	const USER_NOT_LOGIN = "You need to login to perform this action"

	const handleSnackBarClose = (event, reason) => {
		if (reason === 'clickaway') {
		return;
		}
		setErrorType('');
	};

	const changeCurrentView = (direction) => {
		let nextIndex = (currentIndex + direction) % props.src.length;
      	if (nextIndex < 0) nextIndex = props.src.length - 1;
     	setCurrentIndex(nextIndex);
	}

	// click outside to close
	const handleClick = (e) => {
		if (!e.target || !props.closeOnClickOutside) {
			return ;
		}
		const checkId = e.target.id === 'ImageViewer';
      	const checkClass = e.target.classList.contains('slide');

		if (checkId || checkClass) {
			e.stopPropagation();
			props.onClose();
		}
	}

	const handleKeyDown = (e) => {
		if (e.key === "Escape") {
			props.onClose();
		}

		switch (e.key) {
			case 'ArrowLeft':
				changeCurrentView(-1)
				break;
			case 'ArrowRight':
				changeCurrentView(1)
				break;
			default:
				null
		}
	}

	const handleWheel = (e) => {
		e.wheelDeltaY > 0 ? changeCurrentView(-1): changeCurrentView(1)
	}


	React.useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
	
		if (!props.disableScroll) {
		  	document.addEventListener("wheel", handleWheel);
		}
		
		//clean up
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		
			if (!props.disableScroll) {
				document.removeEventListener("wheel", handleWheel);
			}
		};
	}, [handleKeyDown, handleWheel]);

	//display red heart or normal heart by looking at if the user already liked or not
	React.useEffect(() => {
		if (props.isAuthenticated){
			fetch('/api/already-like-photo' + '?photo_id=' + props.photos[currentIndex].unique_id, {method: 'GET'})
			.then(res => {
				if (res.ok){
					return res.json()
				}else{
					return res.text().then(text => {
						setErrorType('get_photo_like_error')
						setGetPhotoErrMsg(String(text).substring(1,String(text).length - 1))
						throw new Error('Get photo failed')
					})
				}
			})
			.then(data => {
				setLiked(data['user_likes_this'])
			})
			.catch(error => console.log(error))

			fetch('/api/get-comment' + '?photo_id=' + props.photos[currentIndex].unique_id, {method: 'GET'})
			.then(res => {
				if (res.ok){
					return res.json()
				}else{
					return res.text().then(text => {
						setErrorType('get_photo_comment_error')
						setGetPhotoCommentErrMsg(String(text).substring(1,String(text).length - 1))
						throw new Error('Get photo comment failed')
					})
				}
			})
			.then(data => setComments(data))
			.catch(error => console.log(error))
		}
		
	}, [currentIndex, state_for_reload]);

	const handleLikeOrUnlikePhoto = async e =>{
		e.preventDefault()
		if (props.isOwner){
			setErrorType('owner_like_photo')
			return
		}

		if (!props.isAuthenticated){
			setErrorType('user_not_login')
			return
		}
		const requestOptions = {
			method: "PUT",
			headers: { 
				'X-CSRFToken': props.csrf_token
			},
		};
		fetch("/api/like-unlike-photo/" + '?photo_id=' + props.photos[currentIndex].unique_id, requestOptions)
			.then(res => {
				if (res.ok){
					setLiked(!liked)
					setErrorType('like_photo_success')
				}else{                        
					return res.text().then(text => {
						setErrorType('like_photo_error')
						setLikePhotoErrMsg(String(text).substring(1,String(text).length - 1))
						throw new Error('Like Photo failed')
					})
				}})
			.catch(error =>{
				console.log(error)
			})
	}

	const handleCommentPhoto = async e =>{
		e.preventDefault()
		if (!props.isAuthenticated){
			setErrorType('user_not_login')
			return
		}
		const requestOptions = {
			method: "PUT",
			headers: { 
				"Content-Type": "application/json",
				'X-CSRFToken': props.csrf_token
			},
			body: JSON.stringify({
				content: comment_to_post,
			}),
		};
		fetch("/api/create-comment/" + '?photo_id=' + props.photos[currentIndex].unique_id, requestOptions)
			.then(res => {
				if (res.ok){
					setErrorType('comment_photo_success')
					setComment_to_post('')
					setState_for_reload(prev => prev + 1)
				}else{                        
					return res.text().then(text => {
						setErrorType('comment_photo_error')
						setCommentPhotoErrMsg(String(text).substring(1,String(text).length - 1))
						throw new Error('Comment Photo failed')
					})
				}})
			.catch(error =>{
				console.log(error)
			})
	}

	const handleDeleteComment = (comment_id) => async e =>{
		setOpen_comment(false);
		e.preventDefault()
		if (!props.isAuthenticated){
			setErrorType('user_not_login')
			return
		}
		const requestOptions = {
			method: "DELETE",
			headers: { 
				'X-CSRFToken': props.csrf_token
			},
		};
		fetch("/api/delete-comment/" + '?comment_id=' + comment_id, requestOptions)
			.then(res => {
				if (res.ok){
					setErrorType('delete_comment_success')
					setState_for_reload(prev => prev + 1)
				}else{                        
					return res.text().then(text => {
						setErrorType('delete_comment_error')
						setDeleteCommentErrMsg(String(text).substring(1,String(text).length - 1))
						throw new Error('Delete Comment failed')
					})
				}})
			.catch(error =>{
				console.log(error)
			})
	}

	const toggleDrawer = (open) => () => {
		setOpen_comment(open);
	};

	const list = () => (
		<Box
		  sx={{'auto' : 250 }}
		  role="presentation"
		>
		  <List>
			{comments.length === 0 ?
			'There is no comment for this photo right now, how about adding one?'
			:
			comments.map((item, index) => (
			  <ListItem key={index}>
				  <a 
				  	href={'https://www.memory-gallery.com/collection/' + item.owner}
                	target='_blank'
                	rel="noreferrer"
					style={{textDecoration: 'none'}}
					>{item.owner}
					</a>
				<ListItemText primary={' @ ' + item.timestamp.slice(0, 10) + ': ' + item.content} /> 
				{item.owner===props.logged_in_user? 
				<Button 
				onClick={handleDeleteComment(item.unique_id)} 
				color='error'>Delete</Button>:null}
			  </ListItem>
			))

			}

			<Divider />
			<ListItem>
				<form style={{display: 'flex', flexDirection: 'column'}} onSubmit={handleCommentPhoto}>
					<TextField
					id="standard-helperText"
					label="Comment"
					multiline
					maxRows={3}
					value={comment_to_post}
					onChange={({target}) => setComment_to_post(target.value)}
					helperText="Each user can have 3 comments on one photo at most"
					variant="standard"
					/>
					<Button 
					variant='contained' 
					color='primary' 
					type='submit'
					onClick={toggleDrawer(false)}
					> Add Comment 
					</Button>
				</form>
				
			</ListItem>
		  </List>
		  
		</Box>
	  );

	return (
		<div
			id='ImageViewer'
			className='wrapper'
			onKeyDown={handleKeyDown}
			onClick={handleClick}
		>	
		<Snackbar 
				open={
					errorType === 'get_photo_like_error' || 
					errorType === 'owner_like_photo' ||
					errorType === 'user_not_login' ||
					errorType === 'like_photo_error' ||
					errorType === 'get_photo_comment_error' ||
					errorType === 'comment_photo_error' ||
					errorType === 'create_photo_comment_error' ||
					errorType === 'delete_photo_comment_error' 
					

				} 
				autoHideDuration={6000} 
				onClose={handleSnackBarClose}>

				<Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
				{errorType === 'get_photo_like_error' && getPhotoErrMsg}
				{errorType === 'owner_like_photo' && OWNER_LIKE_PHOTO}
				{errorType === 'user_not_login' && USER_NOT_LOGIN}
				{errorType === 'like_photo_error' && likePhotoErrMsg}
				{errorType === 'get_photo_comment_error' && getPhotoCommentErrMsg}
				{errorType === 'comment_photo_error' && commentPhotoErrMsg}
				{errorType === 'delete_photo_comment_error' && deleteCommentErrMsg}
				</Alert>
		</Snackbar>

		<Snackbar 
				open={
					errorType === 'like_photo_success' || 
					errorType === 'comment_photo_success' ||
					errorType === 'delete_comment_success' 
				} 
				autoHideDuration={6000} 
				onClose={handleSnackBarClose}>

				<Alert onClose={handleSnackBarClose} severity="success" sx={{ width: '100%' }}>
				{errorType === 'like_photo_success' && 'Action performed'}
				{errorType === 'comment_photo_success' && 'comment post successfully'}
				{errorType === 'delete_comment_success' && 'comment delete successfully'}
				</Alert>
		</Snackbar>
			
			<span
			className='exif_info'
			>
			{ 'test' }
			</span>

			<span
			className='close'
			onClick={() => props.onClose()}
			>
			{ "×" }
			</span>

			<span
			className='like_button'
			onClick={props.isAuthenticated? handleLikeOrUnlikePhoto : () =>setErrorType('user_not_login')}
			>
			{ liked ? 
			<FavoriteIcon fontSize='large' color='error' /> 
			: 
			<FavoriteBorderIcon fontSize="large" /> 
			}
			</span>

			<span
			className='comment_button'
			onClick={props.isAuthenticated? toggleDrawer(true) : () =>setErrorType('user_not_login')}
			>
			<CommentIcon fontSize="large"/>
			</span>	
			<Drawer
				anchor={'bottom'}
				open={open_comment}
				onClose={toggleDrawer(false)}
			>
            {list()}
          	</Drawer>

			{props.src.length > 1 && (
			<span
				className={"navigation prev"}
				onClick={() => changeCurrentView(-1)}
			>
				{ "❮" }
			</span>
			)}

			{props.src.length > 1 && (
			<span
				className="navigation next"
				onClick={() => changeCurrentView(1)}
			>
				{ "❯" }
			</span>
			)}

			<div
			className='content'
			onClick={handleClick}
			>
			<div className='slide'>
				<img className='image' src={props.src[currentIndex]} alt="" />
			</div>
			</div>
		</div>
		);

}