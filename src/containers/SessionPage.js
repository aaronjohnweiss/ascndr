import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { compareGrades, gradeEquals, prettyPrint } from '../helpers/gradeUtils'
import GradeModal from '../components/GradeModal'
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

    addStandardRoute = (grade) => {
        const session = Object.assign({}, this.props.session)

        const route = session.standardRoutes.find(rt => gradeEquals(rt.key, grade))

        if (route) {
            route.count += 1
        } else {
            session.standardRoutes.push({
                key: grade,
                count: 1
            })
        }

        this.updateSession(session)
        this.hideModal('standardRoutes')
    }

    removeStandardRoute = (grade) => {
        const session = Object.assign({}, this.props.session)

        const routeIndex = session.standardRoutes.findIndex(rt => gradeEquals(rt.key, grade))

        if (routeIndex > -1 && session.standardRoutes[routeIndex].count > 1) {
            session.standardRoutes[routeIndex].count -= 1
        } else if (routeIndex > -1) {
            session.standardRoutes.splice(routeIndex, 1)
        }

        this.updateSession(session)
    }

    addCustomRoute = (key) => {
        const session = Object.assign({}, this.props.session)

        const route = session.customRoutes.find(rt => rt.key === key)

        if (route) {
            route.count += 1
        } else {
            session.customRoutes.push({
                key: key,
                count: 1
            })
        }

        this.updateSession(session)
        this.hideModal('customRoutes')
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
            [prettyPrint(entry.key)]: entry.count
        }), {})

        // Filter to only routes for this session
        const routesForSession = this.props.routes.filter(route => customRoutesMap[route.key])

        const gym = gyms.find(gym => gym.key === session.gymId)

        const allGrades = [...routesForSession.map(route => route.value.grade), ...session.standardRoutes.map(entry => entry.key)]
        const grades = allGrades.filter((grade, idx) => allGrades.findIndex(val => gradeEquals(val, grade)) === idx).sort(compareGrades).reverse()

        const date = new Date(session.startTime).toDateString()

        const routesForGym = this.props.routes.filter(route => route.value.gymId === gym.key && !route.value.isRetired)

        const customModal = <ListModal show={this.state.customRoutes}
                                       handleClose={() => this.hideModal('customRoutes')}
                                       handleSubmit={this.addCustomRoute}
                                       title='Add custom route'
                                       listContent={
                                           routesForGym.map(route => ({
                                               id: route.key,
                                               label: route.value.name
                                           }))
                                       }
        />

        const standardModal = <GradeModal show={this.state.standardRoutes}
                                         handleClose={() => this.hideModal('standardRoutes')}
                                         handleSubmit={this.addStandardRoute}
                                         title='Add generic route'
        />

        const addRouteButton = (grade) => {
            return <Button variant='outline-secondary' className='plus-minus-button'
                           onClick={() => this.addStandardRoute(grade)}>
                +
            </Button>
        }

        const removeRouteButton = (grade) => {
            return <Button variant='outline-secondary' className='plus-minus-button'
                           onClick={() => this.removeStandardRoute(grade)}>
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
                            const gradeLabel = prettyPrint(grade)
                            const customRoutesForGrade = routesForSession.filter(route => gradeEquals(route.value.grade, grade))
                            const standardCountForGrade = standardRoutesMap[gradeLabel] || 0
                            const countForGrade = customRoutesForGrade.reduce((acc, route) => acc + (customRoutesMap[route.key] || 0), 0) + standardCountForGrade
                            return (
                                <Fragment key={gradeLabel}>
                                    <h5 className='session-grade-header'>{gradeLabel} ({countForGrade}) {addRouteButton(grade)} {standardCountForGrade > 0 && removeRouteButton(grade)}</h5>
                                    {customRoutesForGrade.map(route => (
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
