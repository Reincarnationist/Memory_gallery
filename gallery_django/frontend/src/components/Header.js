import React from 'react'
import '../../static/css/header.css';
import logo from '../../static/images/camera-logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { Link } from "react-router-dom";
export default class Header extends React.Component {
    constructor(props) {
        super(props);
      }
    render(){
        return (
            <header className='header'>
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
                            <Link title="My account" to="/authenticate" className="cat"><FontAwesomeIcon icon={faUserCircle} /></Link>
                    </span>
                    
                </span>
                    
            </header>
            
        )
    }

}

