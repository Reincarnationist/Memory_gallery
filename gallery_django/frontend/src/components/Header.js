import * as React from 'react';
import '../../static/css/header.css';
import logo from '../../static/images/camera-logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { Link, useHistory } from "react-router-dom";

import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

export default function Header(){
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [authenticated, setAuthenticated] = React.useState(false);
	const [authenticated_username, setAuthenticated_username] = React.useState('');
	const [errorType, setErrorType] = React.useState('')
	const [logoutErrMsg, setLogoutErrMsg] = React.useState('')
	const open = Boolean(anchorEl);
	const history = useHistory()
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);		
	};

	const handleSnackBarClose = (event, reason) => {
		if (reason === 'clickaway') {
		  return;
		}
		setErrorType('');
	  };

	React.useEffect(() => {
		const logged_in_user = sessionStorage.getItem('username')
			if (logged_in_user){
				setAuthenticated(true)
				setAuthenticated_username(logged_in_user)
			}
	  });
	
	const handleLogout = async e =>{
		e.preventDefault()
		fetch("/auth/csrf/")
			.then(res => res.json())
			.then(res => {
				return fetch("/auth/logout/", {
				method: "POST",
				headers: { 
					'X-CSRFToken': res.csrfToken
					},})
					.then(res => {
						if (res.ok){
							setErrorType('logout_success')
						}else{

							return res.text().then(text => {
								setErrorType('logout_error')
								setLogoutErrMsg(String(text).substring(1,String(text).length - 1))
								throw new Error('Logout failed')
							})
						}})
					.then((data) => {
						setAuthenticated(false)
						sessionStorage.removeItem('username')
						setTimeout(() => history.push("/"), 3000);
						
					})
					.catch(error =>{
						null
					})
			})
	}
	return (
		<header className='header'>
			{/* snackbar for logout feedback, see DeleteAccount.js for reason to have indivial bars */}
			<Snackbar open={errorType === 'logout_success'} autoHideDuration={6000} onClose={handleSnackBarClose}>
			<Alert onClose={handleSnackBarClose} 
			severity={"success"} 
			sx={{ width: '100%' }}>
			"Logout Successfully!"
			</Alert></Snackbar>

			<Snackbar open={errorType === 'logout_error'} autoHideDuration={6000} onClose={handleSnackBarClose}>
			<Alert onClose={handleSnackBarClose} 
			severity={"error"} 
			sx={{ width: '100%' }}>
			{logoutErrMsg}
			</Alert></Snackbar>

			<span className='span_wrapper'>
				<Link to='/home' className='header_links'>
					<span style={{ marginRight: '5px', height: 34}}>Memory Gallery</span>
					<span><img src={logo} style={{width: 40, height: 30}}/></span>
					</Link>
					
				<span className='header_right'>
					<nav className='menu'>
						<ul className='menu_inner'>
							<li><Link 
									to="/myalbum" 
									className='header_links'
									style={{
										color: 'lightblue',
									}}>My Collection</Link></li>
							<li><Link 
									to="/uploadalbum" 
									className='header_links'
									style={{color: ' #FF6F61'}}>Upload Memories</Link></li>
							<li><Link 
									to="/feelinglucky" 
									className='header_links'
									style={{color: '#B565A7'}}>Feeling Lucky</Link></li>
							</ul>
						</nav>
						<Button
							id="fade-button"
							aria-controls={open ? 'fade-menu' : undefined}
							aria-haspopup="true"
							aria-expanded={open ? 'true' : undefined}
							onClick={handleClick}
							style={{cursor: 'pointer'}}
						>
							<FontAwesomeIcon icon={faUserCircle} style={{fontSize: '1.5rem'}}/>
						</Button>
						<Menu
							id="fade-menu"
							MenuListProps={{
							'aria-labelledby': 'fade-button',
							}}
							anchorEl={anchorEl}
							open={open}
							onClose={handleClose}
							TransitionComponent={Fade}
						>
							{/* This seems stupid but react doesn't allow elements in a 
								block not have a parent div */}
						{authenticated && 
						<MenuItem onClick={() => history.push(`/account/${authenticated_username}`)}>
							Settings
							</MenuItem>}
						{authenticated && <MenuItem onClick={handleLogout}>Logout</MenuItem>}
						{!authenticated && 
						<MenuItem onClick={() => history.push("/authenticate")}>
							Login
						</MenuItem>}

							
						</Menu>
				</span>
				
			</span>
				
		</header>
		
	)
}



