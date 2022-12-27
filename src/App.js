import React, {useEffect, useState} from 'react'
import GymIndex from './containers/GymIndex'
import {BrowserRouter as Router, Link, Route} from 'react-router-dom'
import GymPage from './containers/GymPage'
import Home from './containers/Home'
import {Button, Container} from 'react-bootstrap'
import './styles/styles.css'
import RoutePage from './containers/RoutePage'
import SessionPage from './containers/SessionPage'
import SignIn from './components/SignIn'
import requireAuth from './components/requireAuth'
import {fetchUser, signOut} from './redux/actions'
import {connect} from 'react-redux'
import denyAuth from './components/denyAuth'
import GroupIndex from './containers/GroupIndex'
import GroupPage from './containers/GroupPage'
import StatsPage from './containers/StatsContainer'
import {FaBars} from "react-icons/fa";
import Sidebar from "./containers/Sidebar";

const App = (props) => {
    const [showSidebar, setShowSidebar] = useState(false)
    const closeSidebar = () => setShowSidebar(false)
    const openSidebar = () => setShowSidebar(true)

    useEffect(() => {
        props.fetchUser()
    }, [])

    let authState

    if (props.authenticated) {
        authState = <li className="nav-item">
            <Link className="nav-link" to='/' onClick={props.signOut}>Sign Out</Link>
        </li>
    } else {
        authState = <li className="nav-item">
            <Link className="nav-link" to='/login'>Sign In</Link>
        </li>
    }

    return (
        <Router>
            <div className="App">
                <Container fluid className="jumbotron py-3 mb-4 d-flex flex-row">
                    <div className="nav-item nav header-left d-flex justify-content-start">
                        <Button variant="link" className="py-0" onClick={openSidebar}><FaBars/></Button>
                    </div>
                    <Link to='/' style={{textDecoration: 'none', color: 'white'}}
                          className="d-flex justify-content-center">
                        <h1 className='text-center display-2 my-0'>ASCNDr</h1>
                    </Link>
                    <div className="px-2 header-right d-flex justify-content-end align-self-end">
                        <p className="nav justify-content-end">
                            {authState}
                        </p>
                    </div>
                </Container>
                <Sidebar show={showSidebar} onHide={closeSidebar} />
                <Container>
                    <div className="px-2">
                        <Route exact path='/' component={Home}/>
                        <Route exact path='/groups' component={requireAuth(GroupIndex)}/>
                        <Route exact path='/groups/:id' component={requireAuth(GroupPage)}/>
                        <Route exact path='/gyms' component={requireAuth(GymIndex)}/>
                        <Route exact path='/gyms/:id' component={requireAuth(GymPage)}/>
                        <Route exact path='/routes/:id' component={requireAuth(RoutePage)}/>
                        <Route exact path='/sessions/:id' component={requireAuth(SessionPage)}/>
                        <Route path='/stats' component={requireAuth(StatsPage)}/>
                        <Route exact path='/login' component={denyAuth(SignIn)}/>
                    </div>
                </Container>
            </div>
        </Router>
    )
}

function mapStateToProps(state) {
    return {authenticated: state.auth}
}

export default connect(mapStateToProps, {fetchUser, signOut})(App)