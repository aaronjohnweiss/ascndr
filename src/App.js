import React, { Component } from 'react'
import './App.css'
import GymIndex from './containers/GymIndex'

export default class App extends Component {

    render() {
        return (
            <div className="App">
                <div className="alert alert-primary" role="alert">
                    ASCNDr
                </div>
                <GymIndex/>
            </div>
        )
    }
}
