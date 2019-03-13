import React, { Component } from 'react'
import GymIndex from './containers/GymIndex'
import { BrowserRouter as Router, Link, Redirect, Route } from 'react-router-dom'
import GymPage from './containers/GymPage'
import { Jumbotron } from 'react-bootstrap'
import './styles/styles.css'
import RoutePage from './containers/RoutePage'
import SessionPage from './containers/SessionPage'

export default class App extends Component {

    render() {
        return (
            <Router>
                <div className="App">

                    <Jumbotron fluid>
                        <Link to='/' style={{ textDecoration: 'none', color: 'white' }}><h1
                            className='text-center'>ASCNDr</h1></Link>
                    </Jumbotron>

                    <Route exact path='/' render={() => <Redirect to='/gyms'/>}/>
                    <Route exact path='/gyms' component={GymIndex}/>
                    <Route exact path='/gyms/:id' component={GymPage}/>
                    <Route exact path='/routes/:id' component={RoutePage}/>
                    <Route exact path='/sessions/:id' component={SessionPage}/>
                </div>
            </Router>
        )
    }
}
