import React from 'react'
import '../../static/css/footer.css'
import react_logo from '../../static/images/react-logo.svg'
import django_logo from '../../static/images/django-logo.svg'

export default class Footer extends React.Component {
    render(){
        return (
            <footer className='footer'>
                <div className='footer_child'>
                    <div className='footer_content'>
                        <span>© 2022</span>
                        <span className='footer_dot'>•</span>
                        <span><a 
                                className='link' href="https://www.steven-yuan.com/" 
                                target="_blank" rel="noreferrer">Ruizhe(Steven) Yuan</a></span>
                        <span className='footer_dot'>•</span>
                        <span><a 
                                className='link'
                                href="https://creativecommons.org/licenses/by-nc/4.0/" 
                                target="_blank" 
                                rel="noreferrer">CC BY-NC 4.0</a></span>
                    </div>
                    </div>
                    <div className='footer_child'>
                        <div className='footer_content'>
                            <span>Built with: </span>
                            <a
                                style={{color:"#61dafb"}}
                                href="https://reactjs.org"
                                target="_blank"
                                rel="noopener noreferrer"
                                title='React.js'>
                                <img src={react_logo} className="App-logo" alt="react logo" /></a>
                                &
                            <a
                                style={{
                                    color:"#61dafb",
                                    }}
                                href="https://www.djangoproject.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                title='Django Framework'>
                                <img 
                                src={django_logo} 
                                alt="django logo" 
                                style={{        
                                    width: '25px',
                                    height: '25px',
                                    marginLeft: '8px',
                                    marginTop: '2px' }}/></a>
                        </div>
                    </div>
                </footer>
        )
    }
}

