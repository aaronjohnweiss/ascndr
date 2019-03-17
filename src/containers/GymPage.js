import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button, Col, ListGroup, Row } from 'react-bootstrap'
import EntityModal from '../components/EntityModal'
import { routeCreateFields } from '../templates/routeFields'
import { gymFields } from '../templates/gymFields'
import { addRoute, addSession, updateGym } from '../redux/actions'
import { Link } from 'react-router-dom'
import durationString from '../helpers/durationString'
import axios from 'axios'

class GymPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showAddRouteModal: false,
            showEditGymModal: false
        }

        this.handleNewRoute = this.handleNewRoute.bind(this)
        this.handleEditedGym = this.handleEditedGym.bind(this)
    }

    showModal = (name) => () => {
        this.setState({ [name]: true })
    }

    hideModal = (name) => () =>  {
        this.setState({ [name]: false })
    }

    handleNewRoute(route) {
        if (route && route.picture) {
            console.log(typeof route.picture)
            // Post to imgur
            const pictureData = new FormData()
            pictureData.set('album', process.env.REACT_APP_ALBUM_ID)
            pictureData.append('image', route.picture)
            const headers = {
                'Authorization': 'Client-ID ' + process.env.REACT_APP_CLIENT_ID,
                'Content-Type': 'multipart/form-data'
            }

            axios.post('https://api.imgur.com/3/image', pictureData, { headers: headers })
                .then(resp => {
                    this.props.addRoute({
                        ...route,
                        picture: resp.data.data.link,
                        gymId: Number(this.props.match.params.id)
                    })
                    this.hideModal('showAddRouteModal')()
                }).catch(err => {
                console.log(err.response)
            })
        } else {
            this.props.addRoute({ ...route, gymId: Number(this.props.match.params.id) })
            this.hideModal('showAddRouteModal')()
        }
    }

    createSession() {
        const { addSession, match } = this.props
        const gymId = Number(match.params.id)

        const session = {
            gymId: gymId,
            startTime: new Date(),
            standardRoutes: {},
            customRoutes: {}
        }

        addSession(session)
    }

    handleEditedGym(gym) {
        this.props.updateGym(gym)
        this.hideModal('showEditGymModal')()
    }

    render() {
        const { gyms, match } = this.props
        const id = Number(match.params.id)

        const gym = gyms.find(gym => gym.id === id)

        if (!gym) return 'Uh oh'

        // Filter to only routes for this gym
        const routes = this.props.routes.filter(route => route.gymId === id)
        const currentRoutes = routes.filter(route => !route.isRetired)
        const retiredRoutes = routes.filter(route => route.isRetired)
        const sessions = this.props.sessions.filter(session => session.gymId === id).sort((a, b) => b.startTime - a.startTime)

        const routeListItem = (route) => (
            <Link to={`/routes/${route.id}`} style={{ textDecoration: 'none' }} key={route.id}>
                <ListGroup.Item action>
                    {route.name}
                </ListGroup.Item>
            </Link>
        )

        return (
            <Fragment>
                <Row>
                    <Col xs={10}>
                <h2>{gym.name}</h2>
                    </Col>
                    <Col xs={2}>
                        <Button onClick={this.showModal('showEditGymModal')} style={{ float: 'right' }}>Edit</Button>
                    </Col>
                </Row>
                <h4>
                    <small>{gym.location}</small>
                </h4>
                <p>Average Wall Height: {gym.height} ft</p>
                <h3>Routes</h3>
                {currentRoutes.length > 0 && (
                    <Fragment>
                        {/* Only show "Current" header if there are also retired routes */}
                        {retiredRoutes.length > 0 && <h4>Current</h4>}
                        <ListGroup>
                            {currentRoutes.map(routeListItem)}
                        </ListGroup>
                    </Fragment>
                )}
                {retiredRoutes.length > 0 && (
                    <Fragment>
                        <h4>Retired</h4>
                        <ListGroup>
                            {retiredRoutes.map(routeListItem)}
                        </ListGroup>
                    </Fragment>
                )}

                <br/>

                <Button variant='primary' block={true} onClick={this.showModal('showAddRouteModal')}>
                    Add Route
                </Button>

                <EntityModal show={this.state.showAddRouteModal}
                             handleClose={this.hideModal('showAddRouteModal')}
                             handleSubmit={this.handleNewRoute}
                             fields={routeCreateFields}/>

                <br/>
                <h3>Sessions</h3>
                <ListGroup>
                    {sessions.map(session => (
                        <Link to={`/sessions/${session.id}`} style={{ textDecoration: 'none' }}
                              key={session.id}>
                            <ListGroup.Item action>
                                {session.startTime.toDateString() + (session.endTime ? `, duration: ${durationString(session)}` : ' (ongoing)')}
                            </ListGroup.Item>
                        </Link>
                    ))}
                </ListGroup>
                <br/>

                <Button variant='primary' block={true} onClick={this.createSession.bind(this)}>
                    Add Session
                </Button>

                <EntityModal show={this.state.showEditGymModal}
                             handleClose={this.hideModal('showEditGymModal')}
                             handleSubmit={this.handleEditedGym}
                             fields={gymFields}
                             title='Edit route'
                             initialValues={{ ...gym }}/>
            </Fragment>
        )
    }
}


const mapStateToProps = state => {
    return {
        gyms: state.gyms,
        routes: state.routes,
        sessions: state.sessions
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addSession: (session) => {
            dispatch(addSession(session))
        },
        addRoute: (route) => {
            dispatch(addRoute(route))
        },
        updateGym: (gym) => {
            dispatch(updateGym(gym))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GymPage)
