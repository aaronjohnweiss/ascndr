import React, {useState} from 'react'
import {Button, Col, Container, ListGroup, Row} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import ConfirmCancelButton from '../components/ConfirmCancelButton'
import axios from 'axios'
import EntityModal from '../components/EntityModal'
import {routeUpdateFields, routeVideoFields} from '../templates/routeFields'
import {isLoaded, useFirebase, useFirebaseConnect} from 'react-redux-firebase'
import {prettyPrint} from '../helpers/gradeUtils'
import {distinct, findUser, getEditorsForGym, getSessionsForRoute, getUserName} from '../helpers/filterUtils';
import RouteHistory from '../components/RouteHistory';
import {dateString} from "../helpers/dateUtils";
import {useModalState} from "../helpers/useModalState";
import {firebaseState, getUser} from "../redux/selectors";

export const PENDING_IMAGE = 'PENDING';
export const FAILED_IMAGE = 'FAILED';

export const uploadImage = (routeRef, picture) => {
    // Post to imgur
    const pictureData = new FormData()
    pictureData.set('album', process.env.REACT_APP_ALBUM_ID || '')
    pictureData.append('image', picture)
    const headers = {
        'Authorization': 'Client-ID ' + process.env.REACT_APP_CLIENT_ID,
        'Content-Type': 'multipart/form-data'
    }

    axios.post('https://api.imgur.com/3/image', pictureData, {headers: headers})
        .then(resp => {
            routeRef.update({picture: resp.data.data.link});
        })
        .catch(err => {
            if (err && err.response) console.log(err.response);
            else console.log(err);
            routeRef.update({picture: FAILED_IMAGE});
        });
}

const RoutePage = ({match: {params: {id}}}) => {
    useFirebaseConnect([
        'gyms',
        'routes',
        'sessions',
        'users'
    ])

    const { uid } = getUser()
    const gyms = firebaseState.gyms.getOrdered()
    const route = firebaseState.routes.getOne(id)
    const sessions = firebaseState.sessions.getOrdered()
    const users = firebaseState.users.getOrdered()

    const firebase = useFirebase()

    const [rotation, setRotation] = useState(0)
    const [showEditModal, openEditModal, closeEditModal] = useModalState()
    const [showVideoModal, openVideoModal, closeVideoModal] = useModalState()

    if (!isLoaded(route) || !isLoaded(gyms) || !isLoaded(sessions) || !isLoaded(users)) return <>Loading</>

    const updateRoute = (route) => {
        firebase.update(`routes/${id}`, route)
    }

    const handleRotate = () => {
        setRotation(r => r + 90)
    }

    const retireRoute = () => {
        const routeCopy = Object.assign({}, route)

        routeCopy.isRetired = true

        updateRoute(routeCopy)
    }

    const handleEditedRoute = (route) => {
        if (route && route.picture && route.picture instanceof File) {
            closeEditModal()
            firebase.update(`routes/${id}`, {...route, picture: PENDING_IMAGE})
                .then(() => uploadImage(firebase.ref(`routes/${id}`), route.picture))
                .catch(err => {
                    console.log(err);
                })
        } else {
            updateRoute({...route})
            closeEditModal()
        }
    }

    const handleNewVideo = ({url, date}) => {
        updateRoute({
            ...route,
            videos: [...(route.videos || []), {uid, url, date: date || new Date().getTime()}].sort((a, b) => b.date - a.date)
        })
        closeVideoModal()
    }

    const removeVideo = url => {
        updateRoute({
            ...route,
            videos: [...(route.videos || []).filter(vid => vid.url !== url)]
        })
    }

    if (!route) return <>Uh oh</>

    const gym = gyms.find(gym => gym.key === route.gymId)
    if (!gym) return <>Uh oh</>

    const renderEditModal = () =>
        <EntityModal show={showEditModal}
                     handleClose={closeEditModal}
                     handleSubmit={handleEditedRoute}
                     fields={routeUpdateFields}
                     title='Edit route'
                     initialValues={{...route}}/>

    const renderVideoModal = () =>
        <EntityModal show={showVideoModal}
                     handleClose={closeVideoModal}
                     handleSubmit={handleNewVideo}
                     fields={routeVideoFields}
                     title='Add video'
                     initialValues={{date: new Date().getTime()}}/>

    let RouteImageComponent;
    if (route.picture === FAILED_IMAGE) {
        RouteImageComponent = <p>(Image upload failed)</p>;
    } else if (route.picture === PENDING_IMAGE) {
        RouteImageComponent = <p>(Image upload in progress)</p>
    } else {
        RouteImageComponent = <img className='img-fluid' alt='' style={{transform: `rotate(${rotation}deg)`}}
                                   src={route.picture} onClick={handleRotate}/>;
    }

    const sessionsForRoute = getSessionsForRoute(sessions, id);
    const uidsForRoute = distinct(sessionsForRoute.map(session => session.value.uid));
    const usersForRoute = uidsForRoute.map(uid => findUser(users, uid));

    const canEdit = getEditorsForGym(gym.value, users).includes(uid)

    return (
        <Container>
            <Row>
                <Col md='2'/>
                <Col md='8'>
                    <Row>
                        <Col xs={10}>
                            <h2>{route.name}
                                <small className='text-muted'> @ <Link
                                    to={`/gyms/${route.gymId}`}>{gym.value.name}</Link>
                                </small>
                            </h2>
                        </Col>
                        <Col xs={2}>
                            {canEdit && <Button onClick={openEditModal} style={{float: 'right'}}>Edit</Button>}
                        </Col>
                    </Row>
                    <h3>{prettyPrint(route.grade) + ' '}
                        <small>({route.color})</small>
                    </h3>
                    {route.setter && <h3>Set by {route.setter}</h3>}
                    {route.isRetired && <h4>Retired</h4>}
                    {RouteImageComponent}
                    <p>{route.description}</p>
                    <RouteHistory routeKey={id} users={usersForRoute} sessions={sessionsForRoute}/>
                    <br/>
                    <div className='d-flex align-items-center mb-1'><h3 className='me-auto'>Videos</h3> <Button onClick={openVideoModal}>Add video</Button></div>
                    <ListGroup>
                        {(route.videos || []).map((video, idx) => <ListGroup.Item className='d-flex align-items-center'
                                                                                  key={idx}>
                            <div className='me-auto'>{getUserName(findUser(users, video.uid))}:&nbsp;
                                <a href={video.url} target="_blank" rel="noopener noreferrer">
                                    {dateString(video.date)}
                                </a>
                            </div>
                            <Button size='sm' onClick={() => removeVideo(video.url)}
                                    style={{visibility: (uid === video.uid) ? 'visible' : 'hidden'}}>-</Button>
                        </ListGroup.Item>)}
                    </ListGroup>
                    <br/>
                    {!route.isRetired && canEdit && (
                        <ConfirmCancelButton handleConfirm={retireRoute}
                                             modalTitle='Retire route?'
                                             modalBody='Retiring this route will prevent it from being added to any sessions.'
                                             buttonText='Retire route'
                                             buttonProps={{variant: 'danger'}}
                                             buttonBlock={true}/>
                    )}
                    {showEditModal && renderEditModal()}
                    {showVideoModal && renderVideoModal()}
                </Col>
                <Col md='2'/>
            </Row>
        </Container>
    )
}

export default RoutePage