import * as React from 'react';
import { 
	Grid,
	Typography,
	CircularProgress,
	Box,
	Card,
	CardContent,
	CardMedia,
	Button,
	CardActionArea,
	CardActions } from '@mui/material';


import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useHistory } from 'react-router-dom'
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

export default function Home() {
	const [albums, setAlbums] = React.useState([])
	const [ready, setReady] = React.useState(false)
	const [getPublicAlbumsErrMsg, setGetPublicAlbumsErrMsg] = React.useState('')
	const history = useHistory()
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
			.catch(error => console.log(error))
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
				{albums.map((item, index) => (
					<Grid item xs={3} key={index}>
						<Card sx={{ 
								maxWidth: 300, 
								height: '100%',
								display: 'flex', 
								justifyContent: 'space-between', 
								flexDirection: 'column' }}>
							<CardActionArea onClick={() => history.push(`/collection/${item.owner}/${item.unique_id}`)}>
								<CardMedia
									component="img"
									alt={item.title}
									height="300"
									image={`${item.photos[0].slice(item.photos[0].indexOf(':') + 1)}`}
									// style={{width: 250, height: 250, objectFit: 'cover'}}
								/>
								<CardContent>
									<Typography gutterBottom variant="h5" component="div">
									{item.title}
									</Typography>
									<Typography variant="body2" color="text.secondary">
									Description: {
									item.description===null?
									'The user did not write anything about this album':
									item.description}
									</Typography>
									<br />
									<Typography variant="body2" color="text.secondary">
										{/* django datetime field:  2022-02-04T01:03:39.531386-05:00*/}
									Create At: {item.create_at.slice(0, item.create_at.indexOf('T'))}
									</Typography>
								</CardContent>
							</CardActionArea>
							
							<CardActions>
								By: 
								<Button 
									variant='text' 
									size="small"
									onClick={() => history.push(`/collection/${item.owner}`)}
									>{item.owner}</Button>
							</CardActions>
						</Card>
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