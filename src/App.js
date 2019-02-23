import React, { Component } from 'react'
import GymIndex from './containers/GymIndex'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import GymPage from './containers/GymPage'

export default class App extends Component {

    render() {
        return (
            <Router>
                <div className="App">
                    <div className='alert alert-primary text-center' role='alert'>
                        ASCNDr
                    </div>

                    <Route exact path='/' render={() => <Redirect to='/gyms'/>}/>
                    <Route exact path='/gyms' component={GymIndex}/>
                    <Route exact path='/gyms/:id' component={GymPage}/>
                </div>
            </Router>
        )
    }
}
