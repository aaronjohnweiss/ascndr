import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { updateSession } from '../redux/actions'
import compareGrades from '../helpers/compareGrades'
import ListModal from '../components/ListModal'
import { Link } from 'react-router-dom'
import ConfirmCancelButton from '../components/ConfirmCancelButton'
import durationString from '../helpers/durationString'

class SessionPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            customRoutes: false,
            standardRoutes: false
        }

        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
        this.renderStandardSubmitButtons = this.renderStandardSubmitButtons.bind(this)
        this.endSession = this.endSession.bind(this)
        this.getSession = this.getSession.bind(this)
    }

    getSession() {
        return this.props.sessions.find(({ id }) => id === Number(this.props.match.params.id))
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
        const session = Object.assign({}, this.getSession())

        const currentCount = session[name][id] || 0
        session[name][id] = currentCount + 1

        this.props.updateSession(session)
        this.hideModal(name)
    }

    removeRoute = (name) => (id) => {
        const session = Object.assign({}, this.getSession())

        const newCount = (session[name][id] || 1) - 1

        if (newCount === 0) delete session[name][id]
        else session[name][id] = newCount

        this.props.updateSession(session)
    }

    endSession() {
        const session = Object.assign({}, this.getSession())

        session.endTime = new Date()

        this.props.updateSession(session)
        this.hideModal('endSession')
    }

    render() {
        const session = this.getSession()

        if (!session) return 'Uh oh'

        // Filter to only routes for this session
        const routes = this.props.routes.filter(route => session.customRoutes && session.customRoutes[route.id])
        const gym = this.props.gyms.find(gym => gym.id === session.gymId)

        const grades = [...new Set([...routes.map(route => route.grade), ...Object.keys(session.standardRoutes)])].sort(compareGrades).reverse()

        const date = new Date(session.startTime).toDateString()

        const routesForGym = this.props.routes.filter(route => route.gymId === gym.id && !route.isRetired)

        const customModal = <ListModal show={this.state.customRoutes}
                                       handleClose={() => this.hideModal('customRoutes')}
                                       handleSubmit={this.addRoute('customRoutes')}
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
                                         handleSubmit={this.addRoute('standardRoutes')}
                                         title='Add generic route'
                                         listContent={
                                             Array.from(new Array(9), (x, i) => '5.' + (i + 6)).map(grade => ({
                                                 id: grade,
                                                 label: grade
                                             }))
                                         }
                                         renderSubmitButtons={this.renderStandardSubmitButtons}
        />

        const addRouteButton = (name) => (id) => {
            return <Button variant='outline-secondary' className='plus-minus-button'
                           onClick={() => this.addRoute(name)(id)}>
                +
            </Button>
        }

        const removeRouteButton = (name) => (id) => {
            return <Button variant='outline-secondary' className='plus-minus-button'
                           onClick={() => this.removeRoute(name)(id)}>
                -
            </Button>
        }

        return (
            <Container>
                <Row>
                    <Col md='2'/>
                    <Col md='8'>
                        {customModal}
                        {standardModal}

                        <h2>Session at <Link
                            to={`/gyms/${gym.id}`}>{gym.name}</Link> on {date} {session.endTime && ` for ${durationString(session)}`}
                        </h2>
                        <h4>
                            <small>{gym.location}</small>
                        </h4>
                        <h3>Routes</h3>
                        {grades && grades.length ? grades.map(grade => {
                            const routesForGrade = routes.filter(route => route.grade === grade)
                            const standardCountForGrade = session.standardRoutes[grade] || 0
                            const countForGrade = routesForGrade.reduce((acc, route) => acc + (session.customRoutes[route.id] || 0), 0) + standardCountForGrade
                            return (
                                <Fragment key={grade}>
                                    <h5 className='session-grade-header'>{grade} ({countForGrade}) {addRouteButton('standardRoutes')(grade)} {standardCountForGrade > 0 && removeRouteButton('standardRoutes')(grade)}</h5>
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
                        {!session.endTime &&
                        <Row>
                            <Col md={12}>
                                <ConfirmCancelButton handleConfirm={this.endSession}
                                                     modalTitle='End session?'
                                                     buttonText='End session'
                                                     buttonProps={{ variant: 'danger', block: true }}/>
                            </Col>
                        </Row>
                        }
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
