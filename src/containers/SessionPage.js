import React from 'react'
import {useSelector} from 'react-redux'
import {Button, Col, Container, Row} from 'react-bootstrap'
import {compareGrades, countPartials, gradeEquals, prettyPrint} from '../helpers/gradeUtils'
import GradeModal, {PARTIAL_MAX} from '../components/GradeModal'
import {Link} from 'react-router-dom'
import {sessionDuration} from '../helpers/durationUtils'
import {isLoaded, useFirebase, useFirebaseConnect} from 'react-redux-firebase'
import {getGymsForUser} from '../helpers/filterUtils';
import {sum} from '../helpers/mathUtils';
import CustomRouteModal from '../components/CustomRouteModal';
import ConfirmCancelButton from '../components/ConfirmCancelButton';
import {routeCount} from '../components/StatsIndex';
import {PartialRoutesAccordion} from '../components/PartialRoutesAccordion';
import EntityModal from "../components/EntityModal";
import {sessionFields} from "../templates/sessionFields";
import {useModalState} from "../helpers/useModalState";

const hasPartialCompletions = ({partials = {}}) => Object.entries(partials).some(([key, val]) => key > 0 && val > 0)
const hasFullCompletions = ({count = 0}) => count > 0;

export const SessionPage = ({match: {params: {id}}, history}) => {
    useFirebaseConnect([
        'gyms',
        'routes',
        'sessions',
        'users'
    ])

    const { uid } = useSelector(state => state.auth)
    const gyms = useSelector(state => state.firebase.ordered.gyms)
    const routes = useSelector(state => state.firebase.ordered.routes)
    const session = useSelector(({firebase: {data}}) => data.sessions && data.sessions[id])
    const users = useSelector(state => state.firebase.ordered.users)

    const firebase = useFirebase()

    const [showCustomRoutes, openCustomRoutes, closeCustomRoutes] = useModalState()
    const [showStandardRoutes, openStandardRoutes, closeStandardRoutes] = useModalState()
    const [showEditSession, openEditSession, closeEditSession] = useModalState()

    const updateSession = (session) => {
        firebase.update(`sessions/${id}`, session)
        closeEditSession()
    }


    const deleteSession = () => {
        firebase.remove(`sessions/${id}`)
        closeEditSession()
        history.push('/')
    }


    const addRoute = (type, key, percentage, keyEquals = (a, b) => a === b) => {
        if (!session[type]) {
            session[type] = []
        }

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

        updateSession(session)
        closeCustomRoutes()
        closeStandardRoutes()
    }

    const removeRoute = (type, key, percentage, keyEquals = (a, b) => a === b) => {
        const session = Object.assign({}, session)

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
            updateSession(session);
        }
    }

    const addStandardRoute = ({percentage, ...key}) => {
        addRoute('standardRoutes', key, percentage, (a, b) => gradeEquals(a, b))
    }

    const removeStandardRoute = ({percentage, ...key}) => {
        removeRoute('standardRoutes', key, percentage, (a, b) => gradeEquals(a, b));
    }

    const addCustomRoute = ({key, percentage}) => {
        addRoute('customRoutes', key, percentage);
    }

    const removeCustomRoute = ({key, percentage}) => {
        removeRoute('customRoutes', key, percentage);
    }

    const endSession = () => {
        const session = Object.assign({}, session)

        session.endTime = new Date().getTime()

        updateSession(session)
    }

    if (!isLoaded(session, routes, gyms, users)) return 'Loading'
    if (!session || !gyms) return 'Uh oh'

    if (!session.customRoutes) session.customRoutes = []
    if (!session.standardRoutes) session.standardRoutes = []

    // Convert to maps for easier consumption
    const customRoutesMap = session.customRoutes.reduce((acc, entry) => ({...acc, [entry.key]: entry}), {})
    const standardRoutesMap = session.standardRoutes.reduce((acc, entry) => ({
        ...acc,
        [prettyPrint(entry.key)]: entry
    }), {})

    // Filter to only routes for this session
    const routesForSession = routes.filter(route => customRoutesMap[route.key])

    const gym = gyms.find(gym => gym.key === session.gymId)

    const allGrades = [...routesForSession.map(route => route.value.grade), ...session.standardRoutes.map(entry => entry.key)]
    const grades = allGrades.filter((grade, idx) => allGrades.findIndex(val => gradeEquals(val, grade)) === idx).sort(compareGrades).reverse()

    const date = new Date(session.startTime).toDateString()

    const isFinished = !!session.endTime;

    const canEdit = uid === session.uid;

    const routesForGym = routes.filter(route => route.value.gymId === gym.key && !route.value.isRetired)

    const customModal = <CustomRouteModal show={showCustomRoutes}
                                          handleClose={closeCustomRoutes}
                                          handleSubmit={addCustomRoute}
                                          customRoutes={routesForGym}
    />

    const standardModal = <GradeModal show={showStandardRoutes}
                                      handleClose={closeStandardRoutes}
                                      handleSubmit={addStandardRoute}
                                      title='Add generic route'
    />

    const addRouteButton = (key, isCustom = false) => {
        return <Button variant='outline-secondary' className='plus-minus-button'
                       onClick={() => isCustom ? addCustomRoute(key) : addStandardRoute(key)}>
            +
        </Button>
    }

    const removeRouteButton = (key, isCustom = false) => {
        return <Button variant='outline-secondary' className='plus-minus-button'
                       onClick={() => isCustom ? removeCustomRoute(key) : removeStandardRoute(key)}>
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
                            <Button onClick={openEditSession}
                                    style={{float: 'right'}}>Edit</Button>
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
                                <Row className='align-items-center session-grade-row' key={gradeLabel}>
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
                                <Row className='align-items-center session-grade-row'
                                     key={gradeLabel + '-partials'}>
                                    <PartialRoutesAccordion grade={grade}
                                                            partialsForGrade={partialsForGrade}
                                                            partialCountForGrade={partialCountForGrade}
                                                            standardPartialCount={standardPartialCount}
                                                            customPartialCount={customPartialCount}
                                                            customsWithPartials={customsWithPartials}
                                                            customRoutesMap={customRoutesMap}
                                                            quickEditButtons={quickEditButtons}/>
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
                                        onClick={openStandardRoutes}>
                                    Add generic
                                </Button>
                            </Col>
                            <Col xs={6} className="d-grid d-block">
                                <Button variant="primary" disabled={!routesForGym.length}
                                        onClick={openCustomRoutes}>
                                    Add custom
                                </Button>
                            </Col>
                        </Row>
                        {!isFinished &&
                        <Row>
                            <Col md={12}>
                                <ConfirmCancelButton handleConfirm={endSession}
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
            <EntityModal show={showEditSession}
                         handleClose={closeEditSession}
                         handleSubmit={updateSession}
                         handleDelete={deleteSession}
                         fields={sessionFields({gyms: getGymsForUser(gyms, users, session.uid)})}
                         title='Edit session'
                         initialValues={{...session}}
            />
        </Container>

    )
}

export default SessionPage
