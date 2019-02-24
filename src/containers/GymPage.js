import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Col, Container, Row } from 'react-bootstrap'

class GymPage extends Component {

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
                    <Col md='2'></Col>
                    <Col md='8'>

                        <h2>{gym.name}</h2>
                        <h4>
                            <small>{gym.location}</small>
                        </h4>
                        <p>Average Wall Height: {gym.height} ft</p>
                        <h3>Routes</h3>
                        {routes.map(route => (
                            <p key={route.id}>{route.name}</p>
                        ))}
                        <h3>Sessions</h3>
                        {sessions.map(session => (
                            <p key={session.id}>{new Date(session.startTime).toDateString()}</p>
                        ))}
                    </Col>
                    <Col md='2'></Col>
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
        //
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GymPage)
