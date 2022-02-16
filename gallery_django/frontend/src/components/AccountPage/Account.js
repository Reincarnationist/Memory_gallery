//This template is from material-ui tabs api
import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useHistory } from "react-router-dom";

import DeletePanel from './DeleteAccount/DeleteAccountStack'
import ChangePassword from './ChangePassword'
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
	<div
	  role="tabpanel"
	  hidden={value !== index}
	  id={`vertical-tabpanel-${index}`}
	  aria-labelledby={`vertical-tab-${index}`}
	  style={{width: '100%'}}
	  {...other}
	>
	  {value === index && (
		<Box sx={{ p: 3 }}>
		  <Typography component={'span'} >{children}</Typography>
		</Box>
	  )}
	</div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
	id: `vertical-tab-${index}`,
	'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabs( {csrf_token} ) {
  	const [value, setValue] = React.useState(0);
	const history = useHistory();
  //check if the user is authenticated
  React.useEffect(() => {
	const logged_in_user = sessionStorage.getItem('username')
		if (!logged_in_user){
			//not logged in
			history.push("/authenticate/")
			
		}
  });

  const handleChange = (event, newValue) => {
	setValue(newValue);
  };

  return (
	<Box
	  sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}
	>
	  <Tabs
		orientation="vertical"
		variant="scrollable"
		value={value}
		onChange={handleChange}
		aria-label="Vertical tabs example"
		sx={{ borderRight: 1, borderColor: 'divider' }}
	  >
		<Tab label="Change Password" {...a11yProps(0)} />
		<Tab label="Change Email" disabled {...a11yProps(1)} /> {/*Feature that hasn't been implemented */}
		<Tab label="Change Profile Info" disabled {...a11yProps(2)} />
		<Tab label="Change Security Questions" disabled {...a11yProps(3)} />
		<Tab label="Bind Social Media" disabled {...a11yProps(4)} />
		<Tab label="" disabled {...a11yProps(5)} />
		<Tab label="Delete Account" style={{color: 'red', fontWeight: 800}} {...a11yProps(6)} />
	  </Tabs>
	  <TabPanel value={value} index={0}>
		<ChangePassword csrf_token={csrf_token}/>
	  </TabPanel>
	  <TabPanel value={value} index={1}>
	  	Change Email
	  </TabPanel>
	  <TabPanel value={value} index={2}>
	  	Change Profile Info
	  </TabPanel>
	  <TabPanel value={value} index={3}>
	  	Change Security Questions
	  </TabPanel>
	  <TabPanel value={value} index={4}>
	  	Bind Social Media
	  </TabPanel>
	  <TabPanel value={value} index={5}>
		Item Six
	  </TabPanel>
	  <TabPanel value={value} index={6}>
		  <DeletePanel csrf_token={csrf_token}/>
	  </TabPanel>
	</Box>
  );
}