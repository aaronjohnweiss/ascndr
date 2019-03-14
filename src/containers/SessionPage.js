import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { updateSession } from '../redux/actions'
import compareGrades from '../helpers/compareGrades'
import ListModal from '../components/ListModal'
import { Link } from 'react-router-dom'

class SessionPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            customRoutes: false,
            standardRoutes: false,
            session: props.sessions.find(({ id }) => id === Number(props.match.params.id))
        }

        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
        this.renderStandardSubmitButtons = this.renderStandardSubmitButtons.bind(this)
    }

    showModal(name) {
        this.setState({ [name]: true })
    }

    hideModal(name) {
        this.setState({ [name]: false })
    }

    renderStandardSubmitButtons(disabled, grade) {
        const submit = this.addRoute('standardRoutes').bind(this)
        return [
            <Button key='-' variant="primary" disabled={disabled} onClick={() => submit(grade + '-')}>
                -
            </Button>,
            <Button key=' ' variant="primary" disabled={disabled} onClick={() => submit(grade)}>
                Even
            </Button>,
            <Button key='+' variant="primary" disabled={disabled} onClick={(() => submit(grade + '+'))}>
                +
            </Button>
        ]
    }

    addRoute = (name) => (id) => {
        const session = Object.assign({}, this.state.session)

        const currentCount = session[name][id] || 0
        session[name][id] = currentCount + 1

        this.props.updateSession(session)
        this.hideModal(name)
    }

    render() {
        const { session } = this.state

        if (!session) return 'Uh oh'

        // Filter to only routes for this session
        const routes = this.props.routes.filter(route => session.customRoutes && session.customRoutes[route.id])
        const gym = this.props.gyms.find(gym => gym.id === session.gymId)

        const grades = [...new Set([...routes.map(route => route.grade), ...Object.keys(session.standardRoutes)])].sort(compareGrades).reverse()

        const date = new Date(session.startTime).toDateString()

        const routesForGym = this.props.routes.filter(route => route.gymId === gym.id)

        const customModal = <ListModal show={this.state.customRoutes}
                                       handleClose={() => this.hideModal('customRoutes')}
                                       handleSubmit={this.addRoute('customRoutes').bind(this)}
                                       title='Add custom route'
                                       listContent={
                                           routesForGym.map(route => ({
                                               id: route.id,
                                               label: route.name
                                           }))
                                       }
        />

        const standardModal = <ListModal show={this.state.standardRoutes}
                                         handleClose={() => this.hideModal('standardRoutes')}
                                         handleSubmit={this.addRoute('standardRoutes').bind(this)}
                                         title='Add generic route'
                                         listContent={
                                             Array.from(new Array(9), (x, i) => '5.' + (i + 6)).map(grade => ({
                                                 id: grade,
                                                 label: grade
                                             }))
                                         }
                                         renderSubmitButtons={this.renderStandardSubmitButtons.bind(this)}
        />

        return (
            <Container>
                <Row>
                    <Col md='2'/>
                    <Col md='8'>
                        {this.state.customRoutes && customModal}
                        {this.state.standardRoutes && standardModal}

                        <h2>Session at <Link to={`/gyms/${gym.id}`}>{gym.name}</Link> on {date}</h2>
                        <h4>
                            <small>{gym.location}</small>
                        </h4>
                        <h3>Routes</h3>
                        {grades && grades.length ? grades.map(grade => {
                            const routesForGrade = routes.filter(route => route.grade === grade)
                            const countForGrade = routesForGrade.reduce((acc, route) => acc + (session.customRoutes[route.id] || 0), 0) + (session.standardRoutes[grade] || 0)
                            return (
                                <Fragment key={grade}>
                                    <h5>{grade} ({countForGrade})</h5>
                                    {routesForGrade.map(route => (
                                        <p key={route.id}>{route.name} ({session.customRoutes[route.id]})</p>
                                    ))}
                                </Fragment>
                            )
                        }) : <p>No routes in this session</p>}


                        <Row>
                            <Col xs={6}>
                                <Button variant='primary' block={true} onClick={() => this.showModal('standardRoutes')}>
                                    Add generic
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button variant='primary' block={true} disabled={!routesForGym.length}
                                        onClick={() => this.showModal('customRoutes')}>
                                    Add custom
                                </Button>
                            </Col>
                        </Row>
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
        updateSession: (session) => {
            dispatch(updateSession(session))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionPage)
