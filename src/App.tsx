import React, { useEffect, useState } from 'react'
import GymIndex from './containers/GymIndex'
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'
import GymPage from './containers/GymPage'
import Home from './containers/Home'
import { Button, Container } from 'react-bootstrap'
import './styles/styles.scss'
import RoutePage from './containers/RoutePage'
import SessionPage from './containers/SessionPage'
import SignIn from './components/SignIn'
import { fetchUser, signOut } from './redux/actions'
import UserPage from './containers/UserPage'
import StatsPage from './containers/StatsContainer'
import { FaBars } from 'react-icons/fa'
import Sidebar from './containers/navigation/Sidebar'
import WorkoutIndex from './containers/WorkoutIndex'
import UserCheck from './containers/UserCheck'
import RoutesContainer from './containers/RoutesContainer'
import { useAppSelector } from './redux/index'
import { useAppDispatch } from './redux'
import BottomNavbar from './containers/navigation/BottomNavbar'
import NewSessionWizard from './containers/NewSessionWizard'

const App = () => {
  const authenticated = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const [showSidebar, setShowSidebar] = useState(false)
  const closeSidebar = () => setShowSidebar(false)
  const openSidebar = () => setShowSidebar(true)

  useEffect(() => {
    fetchUser(dispatch)
  }, [])

  let authState

  if (!authenticated) {
    authState = (
      <li className="nav-item">
        <Link className="nav-link" to="/login">
          Sign In
        </Link>
      </li>
    )
  }

  return (
    <Router>
      <div className="App">
        <Container fluid className="jumbotron pt-3 pb-4 d-flex flex-row">
          <div className="nav-item nav header-left d-flex justify-content-start">
            <Button variant="link" className="py-0" onClick={openSidebar}>
              <FaBars fontSize={20}/>
            </Button>
          </div>
          <div className="logo">
            <a href ="/"><img src={require("./styles/logo.png")} alt="logo" height={"35"} /></a>
          </div>
          <div className="nav-item nav header-right d-flex justify-content-end">
            <p className="nav">{authState}</p>
          </div>
        </Container>
        <Sidebar show={showSidebar} onHide={closeSidebar} />
        <Container className="main-content">
          <div className="px-2">
            {(authenticated && (
              <>
                <Route exact path="/" component={Home} />
                <Route exact path="/user" component={UserPage} />
                <Route exact path="/gyms" component={GymIndex} />
                <Route exact path="/gyms/:id" component={GymPage} />
                <Route exact path="/routes/:id" component={RoutePage} />
                <Route exact path="/sessions/:id" component={SessionPage} />
                <Route exact path="/newSession" component={NewSessionWizard} />
                <Route path="/stats" component={StatsPage} />
                <Route path="/routeGallery" component={RoutesContainer} />
                <Route exact path="/workouts" component={WorkoutIndex} />
                <Route exact path="/login" component={SignIn} />
              </>
            )) || (
              <>
                <Switch>
                  <Route exact path="/login" component={SignIn} />
                  <Route component={Home} />
                </Switch>
              </>
            )}
          </div>
        </Container>
        {authenticated && <BottomNavbar />}
      </div>
    </Router>
  )
}

export default App
