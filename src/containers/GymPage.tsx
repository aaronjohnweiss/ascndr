import React, {Fragment} from 'react'
import {isLoaded, useFirebase, useFirebaseConnect} from 'react-redux-firebase'
import {Button, Col, ListGroup, Row} from 'react-bootstrap'
import EntityModal from '../components/EntityModal'
import {routeCreateFields} from '../templates/routeFields'
import {gymFields} from '../templates/gymFields'
import {Link} from 'react-router-dom'
import {sessionDuration} from '../helpers/durationUtils'
import TruncatedList from '../components/TruncatedList'
import {getEditorsForGym, getRoutesForGym, getSessionsForUserAndGym} from '../helpers/filterUtils';
import {PENDING_IMAGE, uploadImage} from './RoutePage';
import {useModalState} from "../helpers/useModalState";
import DeleteGymModal from "./DeleteGymModal";
import {firebaseState, getUser} from "../redux/selectors";

const GymPage = ({match: {params: {id}}, history}) => {
    useFirebaseConnect([
        'gyms',
        'routes',
        'sessions',
        'users'
    ])

    const { uid } = getUser()
    const gym = firebaseState.gyms.getOne(id)
    const routes = firebaseState.routes.getOrdered()
    const sessions = firebaseState.sessions.getOrdered()
    const users = firebaseState.users.getOrdered()

    const firebase = useFirebase()

    const [showRouteModal, openRouteModal, closeRouteModal] = useModalState(false)
    const [showEditModal, openEditModal, closeEditModal] = useModalState(false)

    if (!isLoaded(gym) || !isLoaded(sessions) || !isLoaded(routes) || !isLoaded(users)) return <>Loading</>
    if (!gym) return <>Uh oh</>

    const handleNewRoute = (route) => {
        if (route && route.picture) {
            closeRouteModal()
            // Push route with picture pending; after imgur upload, update route with image link
            firebase.push('routes', {...route, picture: PENDING_IMAGE, gymId: id})
                .then(routeRef => uploadImage(routeRef, route.picture))
                .catch(err => {
                    console.log(err);
                })
        } else {
            firebase.push('routes', {...route, gymId: id})
            closeRouteModal()
        }
    }

    const createSession = async () => {

        const session = {
            gymId: id,
            uid: uid,
            startTime: new Date().getTime(),
            standardRoutes: [],
            customRoutes: []
        }

        const {key} = await firebase.push('sessions', session)
        if (key) {
            history.push('/sessions/' + key);
        }
    }

    const handleEditedGym = (gym) => {
        firebase.update(`gyms/${id}`, gym)
        closeEditModal()
    }

    // Filter to only routes for this gym
    const routesForGym = getRoutesForGym(routes, id);
    const currentRoutes = routesForGym.filter(route => !route.value.isRetired).reverse()
    const retiredRoutes = routesForGym.filter(route => route.value.isRetired).reverse()
    const sessionsForUser = getSessionsForUserAndGym(sessions, id, uid).sort((a, b) => b.value.startTime - a.value.startTime)

    const canEdit = getEditorsForGym(gym, users).includes(uid)

    const canDelete = gym.owner === uid

    const routeListItem = ({key, value}) => (
        <Link to={`/routes/${key}`} style={{textDecoration: 'none'}} key={key}>
            <ListGroup.Item action>
                {value.name}
            </ListGroup.Item>
        </Link>
    )

    return (
        <Fragment>
            <Row>
                <Col xs={10}>
                    <h2>{gym.name}</h2>
                </Col>
                <Col xs={2}>
                    {canEdit && <Button onClick={openEditModal} style={{float: 'right'}}>Edit</Button>}
                </Col>
            </Row>
            <h4>
                <small>{gym.location}</small>
            </h4>
            <Link to={`/stats?gyms=${id}`}>View stats</Link>
            <Row>
                <Col xs={6}>
                    <h3>Routes</h3>
                </Col>
                <Col xs={6}>
                    {canEdit && <Button variant='primary' onClick={openRouteModal} style={{float: 'right'}}>
                        Add Route
                    </Button>}
                </Col>
            </Row>
            {currentRoutes.length > 0 && (
                <Fragment>
                    {/* Only show "Current" header if there are also retired routes */}
                    {retiredRoutes.length > 0 && <h4>Current</h4>}
                    <TruncatedList pageSize={5} initialSize={2}>
                        {currentRoutes.map(routeListItem)}
                    </TruncatedList>
                </Fragment>
            )}
            {retiredRoutes.length > 0 && (
                <Fragment>
                    <h4>Retired</h4>
                    <TruncatedList pageSize={5} initialSize={2}>
                        {retiredRoutes.map(routeListItem)}
                    </TruncatedList>
                </Fragment>
            )}

            <br/>

            <EntityModal show={showRouteModal}
                         handleClose={closeRouteModal}
                         handleSubmit={handleNewRoute}
                         fields={routeCreateFields}/>

            <br/>
            <Row>
                <Col xs={6}>
                    <h3>Sessions</h3>
                </Col>
                <Col xs={6}>
                    <Button variant='primary' onClick={createSession} style={{float: 'right'}}>
                        Add Session
                    </Button>
                </Col>
            </Row>

            <TruncatedList pageSize={5}>
                {sessionsForUser.map(session => (
                    <Link to={`/sessions/${session.key}`} style={{textDecoration: 'none'}}
                          key={session.key}>
                        <ListGroup.Item action>
                            {new Date(session.value.startTime).toDateString() + (session.value.endTime ? `, duration: ${sessionDuration(session.value)}` : ' (ongoing)')}
                        </ListGroup.Item>
                    </Link>
                ))}
            </TruncatedList>

            {canDelete && <DeleteGymModal gymId={id} history={history}/>}

            <EntityModal show={showEditModal}
                         handleClose={closeEditModal}
                         handleSubmit={handleEditedGym}
                         fields={gymFields}
                         title='Edit gym'
                         initialValues={{...gym}}/>
        </Fragment>
    )
}

export default GymPage
