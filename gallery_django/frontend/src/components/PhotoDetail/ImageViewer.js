// The basic idea is from 'react-simple-image-viewer'
import * as React from 'react';
import '../../../static/css/imageviewer.css'

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ImageViewer(props) {
	const [currentIndex, setCurrentIndex] = React.useState(props.currentIndex ?? 0);
	const [liked, setLiked] = React.useState(false);

	const [errorType, setErrorType] = React.useState('');
	const [getPhotoErrMsg, setGetPhotoErrMsg] = React.useState('');
	const [likePhotoErrMsg, setLikePhotoErrMsg] = React.useState('');
	const [commentPhotoErrMsg, setCommentPhotoErrMsg] = React.useState('');

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
		}
		
	}, [currentIndex]);

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
					errorType === 'like_photo_error' 

				} 
				autoHideDuration={6000} 
				onClose={handleSnackBarClose}>

				<Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
				{errorType === 'get_photo_like_error' && getPhotoErrMsg}
				{errorType === 'owner_like_photo' && OWNER_LIKE_PHOTO}
				{errorType === 'user_not_login' && USER_NOT_LOGIN}
				{errorType === 'like_photo_error' && likePhotoErrMsg}
				{errorType === 'comment_photo_error' && commentPhotoErrMsg}
				</Alert>
		</Snackbar>

		<Snackbar 
				open={
					errorType === 'like_photo_success' || 
					errorType === 'comment_photo_success'
				} 
				autoHideDuration={6000} 
				onClose={handleSnackBarClose}>

				<Alert onClose={handleSnackBarClose} severity="success" sx={{ width: '100%' }}>
				{errorType === 'like_photo_success' && 'Action performed'}
				{errorType === 'comment_photo_success' && 'comment post successfully'}
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
			onClick={handleLikeOrUnlikePhoto}
			>
			{ liked ? 
			<FavoriteIcon fontSize='large' color='error' /> 
			: 
			<FavoriteBorderIcon fontSize="large" /> 
			}
			</span>

			<span
			className='comment_button'
			onClick={() => props.onClose()}
			>
			<CommentIcon fontSize="large"/>
			</span>	
				

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