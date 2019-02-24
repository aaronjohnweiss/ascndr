import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Container, ListGroup, Row } from 'react-bootstrap'
import NewEntityModal from '../components/NewEntityModal'
import { routeFields } from '../templates/routeFields'
import { addRoute, addSession } from '../redux/actions'
import { Link } from 'react-router-dom'

class GymPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showModal: false
        }
    }

    showModal() {
        this.setState({ showModal: true })
    }

    hideModal() {
        this.setState({ showModal: false })
    }

    handleNewRoute(route) {
        route = { ...route, gymId: Number(this.props.match.params.id) }
        this.props.addRoute(route)
        this.hideModal()
    }

    createSession() {
        const { addSession, match } = this.props
        const gymId = Number(match.params.id)

        const session = {
            gymId: gymId,
            startTime: Date.now()
        }

        addSession(session)
    }

    render() {
        const { gyms, match } = this.props
        const id = Number(match.params.id)

        const gym = gyms.find(gym => gym.id === id)

        if (!gym) return 'Uh oh'

        // Filter to only routes for this gym
        const routes = this.props.routes.filter(route => route.gymId === id)
        const sessions = this.props.sessions.filter(session => session.gymId === id)

        return (
            <Container>
                <Row>
                    <Col md='2'/>
                    <Col md='8'>

                        <h2>{gym.name}</h2>
                        <h4>
                            <small>{gym.location}</small>
                        </h4>
                        <p>Average Wall Height: {gym.height} ft</p>
                        <h3>Routes</h3>
                        <ListGroup>
                            {routes.map(route => (
                                <Link to={`/routes/${route.id}`} style={{ textDecoration: 'none' }}>
                                    <ListGroup.Item action key={route.id}>
                                        {route.name}
                                    </ListGroup.Item>
                                </Link>
                            ))}
                        </ListGroup>
                        <br/>

                        <Button variant='primary' block={true} onClick={this.showModal.bind(this)}>
                            Add Route
                        </Button>

                        <NewEntityModal show={this.state.showModal}
                                        handleClose={this.hideModal.bind(this)}
                                        handleSubmit={this.handleNewRoute.bind(this)}
                                        fields={routeFields}/>

                        <h3>Sessions</h3>
                        <ListGroup>
                            {sessions.map(session => (
                                <Link to={`/sessions/${session.id}`} style={{ textDecoration: 'none' }}>
                                    <ListGroup.Item action key={session.id}>
                                        {new Date(session.startTime).toDateString()}
                                    </ListGroup.Item>
                                </Link>
                            ))}
                        </ListGroup>
                        <br/>

                        <Button variant='primary' block={true} onClick={this.createSession.bind(this)}>
                            Add Session
                        </Button>
                    </Col>
                    <Col md='2'/>
                </Row>
            </Container>

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
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GymPage)
