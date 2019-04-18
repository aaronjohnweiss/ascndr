import React, { Component } from 'react'
import GymIndex from './containers/GymIndex'
import { BrowserRouter as Router, Link, Route } from 'react-router-dom'
import GymPage from './containers/GymPage'
import Home from './containers/Home'
import { Col, Container, Jumbotron } from 'react-bootstrap'
import './styles/styles.css'
import RoutePage from './containers/RoutePage'
import SessionPage from './containers/SessionPage'
import SignIn from './components/SignIn'
import requireAuth from './components/requireAuth'
import { fetchUser, signOut } from './redux/actions'
import { connect } from 'react-redux'
import denyAuth from './components/denyAuth'
import GroupIndex from './containers/GroupIndex'
import GroupPage from './containers/GroupPage'

class App extends Component {
    componentWillMount() {
        this.props.fetchUser()
    }

    render() {

        let authState

        if (this.props.authenticated) {
            authState = <li className="nav-item">
                <Link className="nav-link" to='/' onClick={this.props.signOut}>Sign Out</Link>
            </li>
        } else {
            authState = <li className="nav-item">
                <Link className="nav-link" to='/login'>Sign In</Link>
            </li>
        }

        return (
            <Router>
                <div className="App">

                    <Jumbotron fluid>
                        <Container>
                            <Link to='/' style={{ textDecoration: 'none', color: 'white' }}>
                                <h1 className='text-center'>ASCNDr</h1>
                            </Link>
                            <Col>
                                <ul className="nav justify-content-end">
                                    {authState}
                                </ul>
                            </Col>
                        </Container>
                    </Jumbotron>
                    <Container>
                        <Col>
                            <Route exact path='/' component={Home}/>
                            <Route exact path='/groups' component={requireAuth(GroupIndex)}/>
                            <Route exact path='/groups/:id' component={requireAuth(GroupPage)}/>
                            <Route exact path='/gyms' component={requireAuth(GymIndex)}/>
                            <Route exact path='/gyms/:id' component={requireAuth(GymPage)}/>
                            <Route exact path='/routes/:id' component={requireAuth(RoutePage)}/>
                            <Route exact path='/sessions/:id' component={requireAuth(SessionPage)}/>
                            <Route exact path='/login' component={denyAuth(SignIn)}/>
                        </Col>
                    </Container>
                </div>
            </Router>
        )
    }
}

function mapStateToProps(state) {
    return { authenticated: state.auth }
}

export default connect(mapStateToProps, { fetchUser, signOut })(App)