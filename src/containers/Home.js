import React, { Component, Fragment } from 'react'
import Features from '../components/Features'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap';

class Home extends Component {

    render() {
        let buttons
        if (this.props.authenticated) {
            buttons =
                <Fragment>
                    <Link to='/gyms'>
                        <Button block style={{marginBottom: '4px'}}>Your Gyms</Button>
                    </Link>
                    <Link to='/groups'>
                        <Button block style={{marginBottom: '4px'}}>Your User</Button>
                    </Link>
                    <Link to={`/stats?uids=${this.props.authenticated.uid}`}>
                        <Button block>Your Stats</Button>
                    </Link>
                </Fragment>
        } else {
            buttons = <Link to={'/login'}>
                <Button block>Get Started</Button>
            </Link>

        }
        return (
            <Fragment>
                <h2>Climbing, tracked.</h2>
                <p>Welcome to ASCNDr. This is a small application designed to help record indoor climbing routes and
                    sessions.</p>
                <Features />
                {buttons}
                <br />
            </Fragment>
        )
    }
}

function mapStateToProps(state) {
    return {authenticated: state.auth}
}

export default connect(mapStateToProps)(Home)