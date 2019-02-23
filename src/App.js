import React, { Component } from 'react'
import './App.css'
import GymIndex from './containers/GymIndex'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'

export default class App extends Component {

    render() {
        return (
            <Router>
                <div className="App">
                    <div className="alert alert-primary" role="alert">
                        ASCNDr
                    </div>

                    <Route exact path='/' render={() => <Redirect to='/gyms'/>}/>
                    <Route exact path='/gyms' component={GymIndex}/>
                </div>
            </Router>
        )
    }
}
