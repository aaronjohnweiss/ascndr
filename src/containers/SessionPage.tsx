import React from 'react'
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
import {useAppSelector} from "../redux/index"
import {getUser} from "../redux/selectors";
import {DecoratedCustomGrade, DecoratedGrade, Grade} from "../types/Grade";
import {RouteCount} from "../types/Session";
import {entries} from "../helpers/recordUtils";

const hasPartialCompletions = ({partials = {}}) => entries(partials).some(([key, val]) => key > 0 && val > 0)
const hasFullCompletions = ({count = 0}) => count > 0;

export type QuickEditButtons = ({key, isCustom}: ({
    key: { percentage?: number, key: string },
    isCustom: true
} | { key: { percentage?: number } & Grade, isCustom?: false })) => JSX.Element
export const SessionPage = ({match: {params: {id}}, history}) => {
    useFirebaseConnect([
        'gyms',
        'routes',
        'sessions',
        'users'
    ])

    const {uid} = getUser()
    const gyms = useAppSelector(state => state.firebase.ordered.gyms)
    const routes = useAppSelector(state => state.firebase.ordered.routes)
    const session = useAppSelector(({firebase: {data}}) => data.sessions && data.sessions[id])
    const users = useAppSelector(state => state.firebase.ordered.users)

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

    const addRoute = <T, >({routes, key, percentage, keyEquals = (a, b) => a === b, updateRoutes}: {
        routes: RouteCount<T>[],
        key: T,
        percentage?: number,
        keyEquals?: (a, b) => boolean
        updateRoutes: (routes: RouteCount<T>[]) => void
    }) => {
        if (!routes) {
            routes = []
        }

        const route = routes.find(rt => keyEquals(rt.key, key))

        if (percentage && percentage < PARTIAL_MAX) {
            if (route) {
                const partials = route.partials || {};
                const newCount = (partials[percentage] || 0) + 1;
                route.partials = {...partials, [percentage]: newCount}
            } else {
                routes.push({
                    key: key,
                    partials: {[percentage]: 1},
                    count: 0
                })
            }
        } else {
            if (route) {
                route.count = (route.count || 0) + 1;
            } else {
                routes.push({
                    key: key,
                    count: 1,
                    partials: {}
                })
            }
        }

        updateRoutes(routes)
        closeCustomRoutes()
        closeStandardRoutes()
    }

    const removeRoute = <T,>({routes, key, percentage, keyEquals = (a, b) => a === b, updateRoutes}: {
        routes: RouteCount<T>[],
        key: T,
        percentage?: number,
        keyEquals?: (a, b) => boolean
        updateRoutes: (routes: RouteCount<T>[]) => void
    }) => {
        if (!routes) {
            routes = []
        }

        const routeIndex = routes.findIndex(rt => keyEquals(rt.key, key))

        if (routeIndex > -1) {
            const route = routes[routeIndex];
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
                routes.splice(routeIndex, 1);
            }
            updateRoutes(routes);
        }
    }

    const addStandardRoute = ({percentage, ...key}: DecoratedGrade) => {
        addRoute({
            routes: session.standardRoutes,
            key: key,
            percentage: percentage,
            keyEquals: (a, b) => gradeEquals(a, b),
            updateRoutes: (standardRoutes) => updateSession({...session, standardRoutes})
        })
    }

    const removeStandardRoute = ({percentage, ...key}: DecoratedGrade) => {
        removeRoute({
            routes: session.standardRoutes,
            key: key,
            percentage: percentage,
            keyEquals: (a, b) => gradeEquals(a, b),
            updateRoutes: (standardRoutes) => updateSession({...session, standardRoutes})
        });
    }

    const addCustomRoute = ({key, percentage}: DecoratedCustomGrade) => {
        addRoute({
            routes: session.customRoutes,
            key: key,
            percentage: percentage,
            updateRoutes: (customRoutes) => updateSession({...session, customRoutes})
        });
    }

    const removeCustomRoute = ({key, percentage}: DecoratedCustomGrade) => {
        removeRoute({
            routes: session.customRoutes,
            key: key,
            percentage: percentage,
            updateRoutes: (customRoutes) => updateSession({...session, customRoutes})
        });
    }

    const endSession = () => {
        const sessionCopy = Object.assign({}, session)

        sessionCopy.endTime = new Date().getTime()

        updateSession(sessionCopy)
    }

    if (!isLoaded(session, routes, gyms, users)) return <>Loading</>
    if (!session || !gyms) return <>Uh oh</>

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
    if (!gym) return <>Uh oh</>

    const allGrades = [...routesForSession.map(route => route.value.grade), ...session.standardRoutes.map(entry => entry.key)].filter((grade): grade is Grade => grade !== undefined)
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

    const quickEditButtons: QuickEditButtons = ({key, isCustom}): JSX.Element => {
        return (
            <>
                <Button variant='outline-secondary' className='plus-minus-button'
                        onClick={() => isCustom ? addCustomRoute(key) : addStandardRoute(key)}>
                    +
                </Button>
                <Button variant='outline-secondary' className='plus-minus-button'
                        onClick={() => isCustom ? removeCustomRoute(key) : removeStandardRoute(key)}>
                    -
                </Button>
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
                        const customPartialCount: number = customsWithPartials.map(route => customRoutesMap[route.key].partials).map(partials => countPartials(partials)).reduce(sum, 0)
                        const partialCountForGrade = standardPartialCount + customPartialCount;
                        return (
                            <div key={gradeLabel}>
                                <Row className='align-items-center session-grade-row' key={gradeLabel}>
                                    <Col>
                                        <h5 className="session-grade-header">{gradeLabel} ({countForGrade})</h5>
                                    </Col>
                                    {canEdit &&
                                        <Col xs={6}>
                                            {quickEditButtons({key: grade})}
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
                                                {quickEditButtons({
                                                    key: {key: route.key},
                                                    isCustom: true
                                                })}
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
