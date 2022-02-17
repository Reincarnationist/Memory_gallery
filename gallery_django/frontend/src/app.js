import * as React from "react";
import { render } from "react-dom";
import '../static/css/app.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'

import Header from "./components/Header";
import Footer from "./components/Footer";
import Welcome from "./components/Welcome"
import Authentication from "./components/Authentication"
import Account from "./components/AccountPage/Account"
import Home from "./components/Home"
import Collection from "./components/CollectionPage/Collection"
import AlbumDetail from "./components/AlbumDetailPage/AlbumDetail"

export default function App(){
	// This token will be changed silently after user login
	// Authentication will reset the token after login
    const [csrf_token, setCsrf_token] = React.useState('')

	React.useEffect(() => {
		fetch("/auth/csrf/")
			.then(res => res.json())
			.then(data => {
				setCsrf_token(data.csrfToken)
			})
	  }, []);


    return (
        <div className="App" >
        
        <Router>

            <Header csrf_token={csrf_token}/>
            <Switch>
          
                <Route exact path="/" component={Welcome} />

                <Route path="/home" render={()=><Home csrf_token={csrf_token}/>}/>

                <Route path="/authenticate" render={()=><Authentication csrf_token={csrf_token} setCsrfChange={setCsrf_token}/>}/>

                <Route path="/account/:username" render={()=><Account csrf_token={csrf_token}/>}/>

				<Route exact path="/collection/:username" render={()=><Collection csrf_token={csrf_token}/>}/>

				<Route path="/collection/:username/:album_id" render={()=><AlbumDetail csrf_token={csrf_token}/>}/>

            </Switch>

        </Router>

        
        <Footer />
      </div>
            
    );
    }


const appDiv = document.getElementById('app');
render(<App />, appDiv)