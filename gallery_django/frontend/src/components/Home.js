import * as React from 'react';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

export default function Home() {
	const [albums, setAlbums] = React.useState('')
	const [ready, setReady] = React.useState(false)
	const [getPublicAlbumsErrMsg, setGetPublicAlbumsErrMsg] = React.useState('')

	const handleSnackBarClose = (event, reason) => {
		if (reason === 'clickaway') {
		  return;
		}
		setErrorType('');
	  };

	React.useEffect(() => {
		fetch('/api/public-albums/', { method: 'GET' })
			.then(res => {
				if (res.ok){
					return res.json()
				}else{
					return res.text().then(text => {
						setGetPublicAlbumsErrMsg(String(text).substring(1,String(text).length - 1))
						throw new Error('Get public albums failed')
					})
				}
			})
			.then(data => {
				setAlbums(data)
				setReady(true)
			})
			.catch(error => null)
	  }, []);

	  return ready ? (
			<Grid container spacing={2} style={{flex: 1, width: '80%', margin: 'auto'}} >
				<Snackbar open={getPublicAlbumsErrMsg !== ''} autoHideDuration={6000} onClose={handleSnackBarClose}>
					<Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
					{getPublicAlbumsErrMsg}
					</Alert>
				</Snackbar>

				<Grid item xs={12}>
					<Typography variant="h3" component="h3" style={{color: '#34568B'}}>
						Welcome to Memory Gallery! 
						</Typography>
					<Typography variant="h4" component="h4">
						<em>Have fun and relax here.</em>
						</Typography>
					<br />
					<Typography variant="h4" component="h4">
						Below are user uploaded albums, check them out!
						</Typography>
				</Grid>
				{albums.map((item) => (
					<Grid item xs={6} key={item.photos[0]}>
						
						<a href="" target="_self" style={{color: 'black'}}>
							<ImageListItem key={item.photos[0]}>
							<img
							// this is dangerous as item.photos can be empty, this is the only
							// place I will use it because the api will only retrieve non-empty albums
								src={`${item.photos[0].slice(item.photos[0].indexOf(':') + 1)}`}
								alt={item.title}
								loading="lazy"
								style={{width: '35vw', height: '50vh', objectFit: 'cover'}}
							/>
							<ImageListItemBar
								title={item.title}
								subtitle={<span>by: {item.owner}</span>}
								position="below"
								style={{textAlign: 'center'}}
							/>
						</ImageListItem>
						</a>
					</Grid>
				))}
			</Grid>
	  )
	  :
	  (
	  <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
      	<CircularProgress />
    	</Box>
		)
	}