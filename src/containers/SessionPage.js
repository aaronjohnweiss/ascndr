import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Container, Row } from 'react-bootstrap'
import compareGrades from '../helpers/compareGrades'
import ListModal from '../components/ListModal'
import { Link } from 'react-router-dom'
import ConfirmCancelButton from '../components/ConfirmCancelButton'
import durationString from '../helpers/durationString'
import { firebaseConnect, getVal, isLoaded } from 'react-redux-firebase'
import { compose } from 'redux'

class SessionPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            customRoutes: false,
            standardRoutes: false
        }

        this.updateSession = this.updateSession.bind(this)
        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
        this.renderStandardSubmitButtons = this.renderStandardSubmitButtons.bind(this)
        this.endSession = this.endSession.bind(this)
    }

    updateSession(session) {
        this.props.firebase.update(`sessions/${this.props.match.params.id}`, session)
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

    addRoute = (name) => (key) => {
        const session = Object.assign({}, this.props.session)

        const route = session[name].find(rt => rt.key === key)

        if (route) {
            route.count += 1
        } else {
            session[name].push({
                key: key,
                count: 1
            })
        }

        this.updateSession(session)
        this.hideModal(name)
    }

    removeRoute = (name) => (key) => {
        const session = Object.assign({}, this.props.session)

        const routeIndex = session[name].findIndex(rt => rt.key === key)

        if (routeIndex > -1 && session[name][routeIndex].count > 1) {
            session[name][routeIndex].count -= 1
        } else if (routeIndex > -1) {
            session[name].splice(routeIndex, 1)
        }

        this.updateSession(session)
    }

    endSession() {
        const session = Object.assign({}, this.props.session)

        session.endTime = new Date().getTime()

        this.updateSession(session)
        this.hideModal('endSession')
    }

    render() {
        const { session, routes, gyms } = this.props

        if (!isLoaded(session, routes, gyms)) return 'Loading'
        if (!session || !gyms) return 'Uh oh'

        if (!session.customRoutes) session.customRoutes = []
        if (!session.standardRoutes) session.standardRoutes = []

        // Convert to maps for easier consumption
        const customRoutesMap = session.customRoutes.reduce((acc, entry) => ({ ...acc, [entry.key]: entry.count }), {})
        const standardRoutesMap = session.standardRoutes.reduce((acc, entry) => ({
            ...acc,
            [entry.key]: entry.count
        }), {})

        // Filter to only routes for this session
        const routesForSession = this.props.routes.filter(route => customRoutesMap[route.key])

        const gym = gyms.find(gym => gym.key === session.gymId)

        const grades = [...new Set([...routesForSession.map(route => route.value.grade), ...session.standardRoutes.map(entry => entry.key)])].sort(compareGrades).reverse()

        const date = new Date(session.startTime).toDateString()

        const routesForGym = this.props.routes.filter(route => route.value.gymId === gym.key && !route.value.isRetired)

        const customModal = <ListModal show={this.state.customRoutes}
                                       handleClose={() => this.hideModal('customRoutes')}
                                       handleSubmit={this.addRoute('customRoutes')}
                                       title='Add custom route'
                                       listContent={
                                           routesForGym.map(route => ({
                                               id: route.key,
                                               label: route.value.name
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
                            to={`/gyms/${gym.key}`}>{gym.value.name}</Link> on {date} {session.endTime && ` for ${durationString(session)}`}
                        </h2>
                        <h4>
                            <small>{gym.value.location}</small>
                        </h4>
                        <h3>Routes</h3>
                        {grades && grades.length ? grades.map(grade => {
                            const routesForGrade = routesForSession.filter(route => route.value.grade === grade)
                            const standardCountForGrade = standardRoutesMap[grade] || 0
                            const countForGrade = routesForGrade.reduce((acc, route) => acc + (customRoutesMap[route.key] || 0), 0) + standardCountForGrade
                            return (
                                <Fragment key={grade}>
                                    <h5 className='session-grade-header'>{grade} ({countForGrade}) {addRouteButton('standardRoutes')(grade)} {standardCountForGrade > 0 && removeRouteButton('standardRoutes')(grade)}</h5>
                                    {routesForGrade.map(route => (
                                        <p key={route.key}>{route.value.name} ({customRoutesMap[route.key]})</p>
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

const mapStateToProps = (state, props) => {
    return {
        session: getVal(state.firebase, `data/sessions/${props.match.params.id}`),
        routes: state.firebase.ordered.routes,
        gyms: state.firebase.ordered.gyms
    }
}

export default compose(
    firebaseConnect([
        { path: 'sessions' },
        { path: 'routes' },
        { path: 'gyms' }
    ]),
    connect(mapStateToProps)
)(SessionPage)
