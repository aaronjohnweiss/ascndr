import React, { Component } from 'react';
import './App.css';
import Gym from './components/Gym'
import {connect} from "react-redux";
import { addGym } from './redux/actions'

class App extends Component {

  render() {
    return (
      <div className="App">
        <div className="alert alert-primary" role="alert">
          ASCNDr
        </div>

          {this.props.gyms.map((gym, index) => <Gym key={index} name={gym.name}/>)}
          <button className='btn btn-primary' onClick={() => this.props.addGym({name: 'Hello'})}>Add Gym</button>
      </div>
    );
  }
}

const mapStateToProps = state => {
    return {
        gyms: state.gyms
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addGym: (gym) => {
            dispatch(addGym(gym))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
