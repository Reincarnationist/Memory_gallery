import React from 'react'
import '../../static/css/welcome.css'
import welcome from '../../static/images/welcome.jpg'
import { Button, Grid, Typography } from "@mui/material";
import { Link } from 'react-router-dom'

export default function Welcome() {

    
	return (
		<div className='welcome' >  
			<div className='container' style={{backgroundColor: 'black'}}>
				
				<img 
					src={welcome} 
					alt="Welcome picture" 
					className='welcome_image'
				/>
				
			</div>
			
			<div className='intro'>
				<Grid container spacing={5} >    
					<Grid item xs={12} align="center" >
						<Typography variant='h3' component='h3' 
							style={{fontWeight: 700, color: '#DD4124'}}>
							Isn't the above photo beautiful? 
						</Typography>
					</Grid>
					<Grid item xs={12} align="center" >
						<Typography variant='h5' component='h5' 
							style={{fontWeight: 700}}>
							You can see tons of these photos taken by others in this gallery!
						</Typography>
					</Grid>
					<Grid item xs={12} align="center" >
						<Typography variant='h5' component='h5' 
							style={{
								fontWeight: 700,
								color: '#009B77',
								}}>
							Sign up now and start sharing and browsering!
						</Typography>
					</Grid>
					<Grid item xs={12} align="center" >
						<Button variant='contained' color="primary" to="/home" component={Link}>
							Get Started
						</Button>
					</Grid>
					
				</Grid>
			</div>
	
		</div>

		
	)
}
