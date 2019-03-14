import React, {Component, Fragment} from 'react'
import Button from "react-bootstrap/es/Button";
import Features from "../components/Features";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

class Home extends Component {

    render() {
        let button;
        if(this.props.authenticated) {
            button = <Link to={'/gyms'}>
                <Button block>Your Gyms</Button>
            </Link>
        } else {
            button = <Link to={'/login'}>
                <Button block>Get Started</Button>
            </Link>

        }
        return (
            <Fragment>
                <h2>Climbing, tracked.</h2>
                <p>Welcome to ASCNDr. This is a small application designed to help record indoor climbing routes and sessions.</p>
                <Features/>
                {button}
                <br/>
            </Fragment>
        )
    }
}

function mapStateToProps(state) {
    return { authenticated: state.auth };
}

export default connect(mapStateToProps)(Home);