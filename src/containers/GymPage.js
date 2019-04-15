import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firebaseConnect, getVal, isEmpty, isLoaded } from 'react-redux-firebase'
import { Button, Col, ListGroup, Row } from 'react-bootstrap'
import EntityModal from '../components/EntityModal'
import { routeCreateFields } from '../templates/routeFields'
import { gymFields } from '../templates/gymFields'
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

    hideModal = (name) => () => {
        this.setState({ [name]: false })
    }

    handleNewRoute(route) {
        if (route && route.picture) {
            // console.log(typeof route.picture)
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
            this.props.firebase.push('routes', { ...route, gymId: this.props.match.params.id })
            this.hideModal('showAddRouteModal')()
        }
    }

    createSession() {
        const { match, firebase } = this.props
        const gymId = match.params.id

        const session = {
            gymId: gymId,
            startTime: new Date().getTime(),
            standardRoutes: [],
            customRoutes: []
        }

        firebase.push('sessions', session)
    }

    handleEditedGym(gym) {
        const { firebase, match } = this.props
        firebase.update(`gyms/${match.params.id}`, gym)
        this.hideModal('showEditGymModal')()
    }

    render() {
        const { match, gym, sessions, routes } = this.props
        const id = match.params.id

        if (!isLoaded(gym, sessions, routes)) return 'Loading'
        if (!gym) return 'Uh oh'

        // Filter to only routes for this gym
        const routesForGym = (isEmpty(routes)) ? [] : routes.filter(route => route.value.gymId === id)
        const currentRoutes = routesForGym.filter(route => !route.value.isRetired)
        const retiredRoutes = routesForGym.filter(route => route.value.isRetired)
        const sessionsForGym = (isEmpty(sessions)) ? [] : sessions.filter(session => session.value.gymId === id).sort((a, b) => b.startTime - a.startTime)

        const routeListItem = ({ key, value }) => (
            <Link to={`/routes/${key}`} style={{ textDecoration: 'none' }} key={key}>
                <ListGroup.Item action>
                    {value.name}
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
                    {sessionsForGym.map(session => (
                        <Link to={`/sessions/${session.key}`} style={{ textDecoration: 'none' }}
                              key={session.key}>
                            <ListGroup.Item action>
                                {new Date(session.value.startTime).toDateString() + (session.value.endTime ? `, duration: ${durationString(session.value)}` : ' (ongoing)')}
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


const mapStateToProps = (state, props) => {
    return {
        gym: getVal(state.firebase, `data/gyms/${props.match.params.id}`),
        routes: state.firebase.ordered.routes,
        sessions: state.firebase.ordered.sessions
    }
}

export default compose(
    firebaseConnect([
        { path: 'gyms' },
        { path: 'routes' },
        { path: 'sessions' }
    ]),
    connect(mapStateToProps)
)(GymPage)
