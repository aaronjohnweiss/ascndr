import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Col, Container, Row } from 'react-bootstrap'
import { addSession } from '../redux/actions'
import compareGrades from '../helpers/compareGrades'
import isGenericRoute from '../helpers/isGenericRoute'

class SessionPage extends Component {

    render() {
        const { sessions, match } = this.props
        const id = Number(match.params.id)

        const session = sessions.find(session => session.id === id)

        if (!session) return 'Uh oh'

        // Filter to only routes for this session
        const routes = this.props.routes.filter(route => session.routeIds && session.routeIds.find(({ id }) => id === route.id))
        const gym = this.props.gyms.find(gym => gym.id === session.gymId)

        const grades = [...new Set(this.props.routes.map(route => route.grade))].sort(compareGrades).reverse()

        const date = new Date(session.startTime).toDateString()

        return (
            <Container>
                <Row>
                    <Col md='2'/>
                    <Col md='8'>

                        <h2>Session at {gym.name} on {date}</h2>
                        <h4>
                            <small>{gym.location}</small>
                        </h4>
                        <h3>Routes</h3>
                        {grades.map(grade => {
                            const routesForGrade = routes.filter(route => route.grade === grade)
                            return (
                                <Fragment key={grade}>
                                    <h5>{grade} ({routesForGrade.length})</h5>
                                    {routesForGrade.filter(route => !isGenericRoute(route)).map(route => (
                                        <p key={route.id}>{route.name}</p>
                                    ))}
                                </Fragment>
                            )
                        })}
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
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionPage)
