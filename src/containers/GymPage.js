import React, {Fragment} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {firebaseConnect, getVal, isLoaded} from 'react-redux-firebase'
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

const GymPage = ({auth: {uid}, match: {params: {id}}, gym, sessions, routes, users, firebase, history}) => {
    const [showRouteModal, openRouteModal, closeRouteModal] = useModalState(false)
    const [showEditModal, openEditModal, closeEditModal] = useModalState(false)

    if (!isLoaded(gym, sessions, routes, users)) return 'Loading'
    if (!gym) return 'Uh oh'

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

    const createSession = () => {

        const session = {
            gymId: id,
            uid: uid,
            startTime: new Date().getTime(),
            standardRoutes: [],
            customRoutes: []
        }

        const {key} = firebase.push('sessions', session)
        if (key) {
            history.push('/sessions/' + key);
        }
    }

    const handleEditedGym = (gym) => {
        firebase.update(`gyms/${id}`, gym)
        closeEditModal()
    }

    // Filter to only routes for this gym
    const routesForGym = getRoutesForGym(routes, {key: id});
    const currentRoutes = routesForGym.filter(route => !route.value.isRetired).reverse()
    const retiredRoutes = routesForGym.filter(route => route.value.isRetired).reverse()
    const sessionsForUser = getSessionsForUserAndGym(sessions, {key: id}, uid).sort((a, b) => b.value.startTime - a.value.startTime)

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
                         title='Edit route'
                         initialValues={{...gym}}/>
        </Fragment>
    )
}


const mapStateToProps = (state, props) => {
    return {
        auth: state.auth,
        gym: getVal(state.firebase, `data/gyms/${props.match.params.id}`),
        routes: state.firebase.ordered.routes,
        sessions: state.firebase.ordered.sessions,
        users: state.firebase.ordered.users,
    }
}

export default compose(
    firebaseConnect([
        {path: 'gyms'},
        {path: 'routes'},
        {path: 'sessions'},
        {path: 'users'},
    ]),
    connect(mapStateToProps)
)(GymPage)
