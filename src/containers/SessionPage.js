import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Button, Col, Container, Row} from 'react-bootstrap'
import {compareGrades, countPartials, gradeEquals, prettyPrint} from '../helpers/gradeUtils'
import GradeModal, {PARTIAL_MAX} from '../components/GradeModal'
import {Link} from 'react-router-dom'
import {sessionDuration} from '../helpers/durationUtils'
import {firebaseConnect, getVal, isLoaded} from 'react-redux-firebase'
import {compose} from 'redux'
import SessionModal from '../components/SessionModal';
import {getGymsForUser} from '../helpers/filterUtils';
import {sum} from '../helpers/mathUtils';
import CustomRouteModal from '../components/CustomRouteModal';
import ConfirmCancelButton from '../components/ConfirmCancelButton';
import {routeCount} from '../components/StatsIndex';
import {PartialRoutesAccordion} from '../components/PartialRoutesAccordion';

const hasPartialCompletions = ({partials = {}}) => Object.entries(partials).some(([key, val]) => key > 0 && val > 0)
const hasFullCompletions = ({count = 0}) => count > 0;

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

    addRoute = (type, key, percentage, keyEquals = (a, b) => a === b) => {
        const session = Object.assign({}, this.props.session)

        const route = session[type].find(rt => keyEquals(rt.key, key))

        if (percentage && percentage < PARTIAL_MAX) {
            if (route) {
                const partials = route.partials || {};
                const newCount = (partials[percentage] || 0) + 1;
                route.partials = {...partials, [percentage]: newCount}
            } else {
                session[type].push({
                    key: key,
                    partials: {[percentage]: 1}
                })
            }
        } else {
            if (route) {
                route.count = (route.count || 0) + 1;
            } else {
                session[type].push({
                    key: key,
                    count: 1
                })
            }
        }

        this.updateSession(session)
        this.hideModal(type)
    }

    removeRoute = (type, key, percentage, keyEquals = (a, b) => a === b) => {
        const session = Object.assign({}, this.props.session)

        const routeIndex = session[type].findIndex(rt => keyEquals(rt.key, key))

        if (routeIndex > -1) {
            const route = session[type][routeIndex];
            if (percentage && percentage < PARTIAL_MAX) {
                if (route.partials && percentage in route.partials) {
                    if (route.partials[percentage] > 1) {
                        route.partials[percentage] -= 1;
                    } else {
                        delete route.partials[percentage];
                    }
                }
            } else {
                if (route.count > 0) {
                    route.count -= 1;
                }
            }

            if (routeCount(route, true) <= 0) {
                session[type].splice(routeIndex, 1);
            }
            this.updateSession(session);
        }
    }

    addStandardRoute = ({percentage, ...key}) => {
        this.addRoute('standardRoutes', key, percentage, (a, b) => gradeEquals(a, b))
    }

    removeStandardRoute = ({percentage, ...key}) => {
        this.removeRoute('standardRoutes', key, percentage, (a, b) => gradeEquals(a, b));
    }

    addCustomRoute = ({key, percentage}) => {
        this.addRoute('customRoutes', key, percentage);
    }

    removeCustomRoute = ({key, percentage}) => {
        this.removeRoute('customRoutes', key, percentage);
    }

    endSession() {
        const session = Object.assign({}, this.props.session)

        session.endTime = new Date().getTime()

        this.updateSession(session)
        this.hideModal('endSession')
    }

    render() {
        const { auth: {uid}, session, routes, gyms, users } = this.props

        if (!isLoaded(session, routes, gyms, users)) return 'Loading'
        if (!session || !gyms) return 'Uh oh'

        if (!session.customRoutes) session.customRoutes = []
        if (!session.standardRoutes) session.standardRoutes = []

        // Convert to maps for easier consumption
        const customRoutesMap = session.customRoutes.reduce((acc, entry) => ({ ...acc, [entry.key]: entry }), {})
        const standardRoutesMap = session.standardRoutes.reduce((acc, entry) => ({
            ...acc,
            [prettyPrint(entry.key)]: entry
        }), {})

        // Filter to only routes for this session
        const routesForSession = this.props.routes.filter(route => customRoutesMap[route.key])

        const gym = gyms.find(gym => gym.key === session.gymId)

        const allGrades = [...routesForSession.map(route => route.value.grade), ...session.standardRoutes.map(entry => entry.key)]
        const grades = allGrades.filter((grade, idx) => allGrades.findIndex(val => gradeEquals(val, grade)) === idx).sort(compareGrades).reverse()

        const date = new Date(session.startTime).toDateString()

        const isFinished = !!session.endTime;

        const canEdit = uid === session.uid;

        const routesForGym = this.props.routes.filter(route => route.value.gymId === gym.key && !route.value.isRetired)

        const customModal = <CustomRouteModal show={this.state.customRoutes}
                                       handleClose={() => this.hideModal('customRoutes')}
                                       handleSubmit={this.addCustomRoute}
                                       customRoutes={routesForGym}
        />

        const standardModal = <GradeModal show={this.state.standardRoutes}
                                         handleClose={() => this.hideModal('standardRoutes')}
                                         handleSubmit={this.addStandardRoute}
                                         title='Add generic route'
        />

        const addRouteButton = (key, isCustom = false) => {
            return <Button variant='outline-secondary' className='plus-minus-button'
                           onClick={() => isCustom ? this.addCustomRoute(key) : this.addStandardRoute(key)}>
                +
            </Button>
        }

        const removeRouteButton = (key, isCustom = false) => {
            return <Button variant='outline-secondary' className='plus-minus-button'
                           onClick={() => isCustom ? this.removeCustomRoute(key) : this.removeStandardRoute(key)}>
                -
            </Button>
        }

        const quickEditButtons = (count, key, isCustom) => {
            return (
                <>
                    {addRouteButton(key, isCustom)}
                    {count > 0 && removeRouteButton(key, isCustom)}
                </>
            )
        }

        return (
            <Container>
                <Row>
                    <Col md='2'/>
                    <Col md='8'>
                        {customModal}
                        {standardModal}
                        <Row>
                            <Col>
                                <h2>
                                    Session at <Link to={`/gyms/${gym.key}`}>{gym.value.name}</Link>
                                </h2>
                            </Col>
                            {isFinished && canEdit &&
                                <Col xs={2}>
                                    <SessionModal session={session} gyms={getGymsForUser(gyms, users, session.uid)} onChange={this.updateSession} buttonProps={{style: {float: 'right'}}}/>
                                </Col>
                            }
                        </Row>
                        <h5 className="fw-normal mb-3">
                            {date} in {gym.value.location} {isFinished && ` for ${sessionDuration(session)}`}
                        </h5>
                        <h3>Routes</h3>
                        {grades && grades.length ? grades.map(grade => {
                            const gradeLabel = prettyPrint(grade)
                            const customRoutesForGrade = routesForSession.filter(route => gradeEquals(route.value.grade, grade))
                            const standardRoutesForGrade = standardRoutesMap[gradeLabel] || {};
                            const standardCountForGrade = standardRoutesForGrade.count || 0;
                            const countForGrade = customRoutesForGrade.map(route => customRoutesMap[route.key].count || 0).reduce(sum, 0) + standardCountForGrade
                            const partialsForGrade = standardRoutesForGrade.partials || {};
                            const standardPartialCount = countPartials(partialsForGrade);
                            const customsWithPartials = customRoutesForGrade.filter(route => hasPartialCompletions(customRoutesMap[route.key]));
                            const customPartialCount = customsWithPartials.map(route => customRoutesMap[route.key].partials).map(partials => countPartials(partials)).reduce(sum, 0)
                            const partialCountForGrade = standardPartialCount + customPartialCount;
                            return (
                                <div key={gradeLabel}>
                                    <Row className='align-items-center session-grade-row' key={gradeLabel} >
                                        <Col>
                                            <h5 className="session-grade-header">{gradeLabel} ({countForGrade})</h5>
                                        </Col>
                                        {canEdit &&
                                        <Col xs={6}>
                                            {quickEditButtons(standardCountForGrade, grade)}
                                        </Col>
                                        }
                                    </Row>
                                    {customRoutesForGrade.filter(route => hasFullCompletions(customRoutesMap[route.key])).map(route => (
                                        <Row className='align-items-center session-grade-row' key={route.key}>
                                            <Col>
                                                {route.value.name} ({customRoutesMap[route.key].count})
                                            </Col>
                                            {canEdit &&
                                            <Col xs={6}>
                                                {quickEditButtons(customRoutesMap[route.key].count, {key: route.key}, true)}
                                            </Col>
                                            }
                                        </Row>
                                    ))}
                                    {partialCountForGrade > 0 &&
                                        <Row className='align-items-center session-grade-row' key={gradeLabel + '-partials'}>
                                            <PartialRoutesAccordion grade={grade}
                                                                    partialsForGrade={partialsForGrade}
                                                                    partialCountForGrade={partialCountForGrade}
                                                                    standardPartialCount={standardPartialCount}
                                                                    customPartialCount={customPartialCount}
                                                                    customsWithPartials={customsWithPartials}
                                                                    customRoutesMap={customRoutesMap}
                                                                    quickEditButtons={quickEditButtons} />
                                        </Row>
                                    }
                                </div>
                            )
                        }) : <p>No routes in this session</p>}


                        {canEdit &&
                        <>
                            <Row>
                                <Col xs={6} className="d-grid d-block">
                                    <Button variant="primary"
                                            onClick={() => this.showModal('standardRoutes')}>
                                        Add generic
                                    </Button>
                                </Col>
                                <Col xs={6} className="d-grid d-block">
                                    <Button variant="primary" disabled={!routesForGym.length}
                                            onClick={() => this.showModal('customRoutes')}>
                                        Add custom
                                    </Button>
                                </Col>
                            </Row>
                            {!isFinished &&
                            <Row>
                                <Col md={12}>
                                    <ConfirmCancelButton handleConfirm={this.endSession}
                                                         modalTitle="End session?"
                                                         buttonText="End session"
                                                         buttonProps={{variant: 'danger'}}
                                                         buttonBlock={true}
                                    />
                                </Col>
                            </Row>
                            }
                        </>
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
        auth: state.auth,
        session: getVal(state.firebase, `data/sessions/${props.match.params.id}`),
        routes: state.firebase.ordered.routes,
        gyms: state.firebase.ordered.gyms,
        users: state.firebase.ordered.users
    }
}

export default compose(
    firebaseConnect([
        { path: 'sessions' },
        { path: 'routes' },
        { path: 'gyms' },
        { path: 'users' }
    ]),
    connect(mapStateToProps)
)(SessionPage)
