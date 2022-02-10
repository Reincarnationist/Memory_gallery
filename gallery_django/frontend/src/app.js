import React from "react";
import { render } from "react-dom";
import '../static/css/app.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'

import Header from "./components/Header";
import Footer from "./components/Footer";
import Welcome from "./components/Welcome"
import Authentication from "./components/Authentication"
import Account from "./components/AccountPage/Account"

export default class App extends React.Component{
    constructor(props){
        super(props)
    }


    render(){
        return (
        <div className="App" >
        
        <Router>

            <Header />
            <Switch>
          
                <Route exact path="/" component={Welcome}/>

                <Route path="/home" component={null}/>

                <Route path="/authenticate" component={Authentication}/>

                <Route path="/account/:username" component={Account}/>

            </Switch>
        </Router>

        
        <Footer />
      </div>
            
            );
    }
}

const appDiv = document.getElementById('app');
render(<App />, appDiv)