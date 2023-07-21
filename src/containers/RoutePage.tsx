import React, { useState } from 'react'
import { Button, Col, Container, ListGroup, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ConfirmCancelButton from '../components/ConfirmCancelButton'
import axios from 'axios'
import EntityModal from '../components/EntityModal'
import { routeUpdateFields, routeVideoFields } from '../templates/routeFields'
import { isLoaded, useFirebase } from 'react-redux-firebase'
import { prettyPrint } from '../helpers/gradeUtils'
import { distinct, findUser, getUserName } from '../helpers/filterUtils'
import RouteHistory from '../components/RouteHistory'
import { dateString } from '../helpers/dateUtils'
import { useModalState } from '../helpers/useModalState'
import { getUser, useDatabase } from '../redux/selectors/selectors'
import { getFirst } from '../redux/selectors/utils'

export const PENDING_IMAGE = 'PENDING'
export const FAILED_IMAGE = 'FAILED'

export const FAILED_OR_PENDING_IMAGE = [PENDING_IMAGE, FAILED_IMAGE]
export const isFailedOrPendingImage = (url: string): boolean =>
  FAILED_OR_PENDING_IMAGE.includes(url)

export const uploadImage = (routeRef, picture) => {
  // Post to imgur
  const pictureData = new FormData()
  pictureData.set('album', process.env.REACT_APP_ALBUM_ID || '')
  pictureData.append('image', picture)
  const headers = {
    Authorization: 'Client-ID ' + process.env.REACT_APP_CLIENT_ID,
    'Content-Type': 'multipart/form-data',
  }

  axios
    .post('https://api.imgur.com/3/image', pictureData, { headers: headers })
    .then(resp => {
      routeRef.update({ picture: resp.data.data.link })
    })
    .catch(err => {
      if (err && err.response) console.log(err.response)
      else console.log(err)
      routeRef.update({ picture: FAILED_IMAGE })
    })
}

const RoutePage = ({
  match: {
    params: { id },
  },
}) => {
  const { uid } = getUser()
  const firebaseState = useDatabase()
  const route = firebaseState.routes.getOne(id)
  const gym = getFirst(firebaseState.gyms.getOrdered(['viewer', uid], ['gymKey', route?.gymId]))
  const sessions = firebaseState.sessions.getOrdered(['viewer', uid], ['route', id])
  const users = firebaseState.users.getOrdered(['friendOf', uid])
  const canEdit = firebaseState.gyms.canEdit(gym?.value)(uid)

  const firebase = useFirebase()

  const [rotation, setRotation] = useState(0)
  const [showEditModal, openEditModal, closeEditModal] = useModalState()
  const [showVideoModal, openVideoModal, closeVideoModal] = useModalState()

  if (
    !isLoaded(route) ||
    !isLoaded(gym) ||
    !isLoaded(sessions) ||
    !isLoaded(users) ||
    !isLoaded(canEdit)
  )
    return <>Loading</>

  const updateRoute = route => {
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

  const handleEditedRoute = route => {
    if (route && route.picture && route.picture instanceof File) {
      closeEditModal()
      firebase
        .update(`routes/${id}`, { ...route, picture: PENDING_IMAGE })
        .then(() => uploadImage(firebase.ref(`routes/${id}`), route.picture))
        .catch(err => {
          console.log(err)
        })
    } else {
      updateRoute({ ...route })
      closeEditModal()
    }
  }

  const handleNewVideo = ({ url, date }) => {
    updateRoute({
      ...route,
      videos: [...(route.videos || []), { uid, url, date: date || new Date().getTime() }].sort(
        (a, b) => b.date - a.date,
      ),
    })
    closeVideoModal()
  }

  const removeVideo = url => {
    updateRoute({
      ...route,
      videos: [...(route.videos || []).filter(vid => vid.url !== url)],
    })
  }

  if (!route) return <>Uh oh</>
  if (!gym) return <>Uh oh</>

  const renderEditModal = () => (
    <EntityModal
      show={showEditModal}
      handleClose={closeEditModal}
      handleSubmit={handleEditedRoute}
      fields={routeUpdateFields}
      title="Edit route"
      initialValues={{ ...route }}
    />
  )

  const renderVideoModal = () => (
    <EntityModal
      show={showVideoModal}
      handleClose={closeVideoModal}
      handleSubmit={handleNewVideo}
      fields={routeVideoFields}
      title="Add video"
      initialValues={{ date: new Date().getTime() }}
    />
  )

  let RouteImageComponent
  if (route.picture === FAILED_IMAGE) {
    RouteImageComponent = <p>(Image upload failed)</p>
  } else if (route.picture === PENDING_IMAGE) {
    RouteImageComponent = <p>(Image upload in progress)</p>
  } else {
    RouteImageComponent = (
      <img
        className="img-fluid"
        alt=""
        style={{ transform: `rotate(${rotation}deg)` }}
        src={route.picture}
        onClick={handleRotate}
      />
    )
  }

  const uidsForRoute = distinct(sessions.map(session => session.value.uid))
  const usersForRoute = uidsForRoute.map(uid => findUser(users, uid))

  const displayVideos =
    route.videos?.filter(video => users.some(u => u.value.uid === video.uid)) || []

  return (
    <Container>
      <Row>
        <Col md="2" />
        <Col md="8">
          <Row>
            <Col xs={10}>
              <h2>
                {route.name}
                <small className="text-muted">
                  {' '}
                  @ <Link to={`/gyms/${route.gymId}`}>{gym.value.name}</Link>
                </small>
              </h2>
            </Col>
            <Col xs={2}>
              {canEdit && (
                <Button onClick={openEditModal} style={{ float: 'right' }}>
                  Edit
                </Button>
              )}
            </Col>
          </Row>
          <h3>
            {prettyPrint(route.grade) + ' '}
            <small>({route.color})</small>
          </h3>
          {route.setter && <h3>Set by {route.setter}</h3>}
          {route.isRetired && <h4>Retired</h4>}
          {RouteImageComponent}
          <p>{route.description}</p>
          <RouteHistory routeKey={id} users={usersForRoute} sessions={sessions} />
          <br />
          <div className="d-flex align-items-center mb-1">
            <h3 className="me-auto">Videos</h3> <Button onClick={openVideoModal}>Add video</Button>
          </div>
          <ListGroup>
            {displayVideos.map((video, idx) => (
              <ListGroup.Item className="d-flex align-items-center" key={idx}>
                <div className="me-auto">
                  {getUserName(findUser(users, video.uid))}:&nbsp;
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    {dateString(video.date)}
                  </a>
                </div>
                <Button
                  size="sm"
                  onClick={() => removeVideo(video.url)}
                  style={{ visibility: uid === video.uid ? 'visible' : 'hidden' }}
                >
                  -
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <br />
          {!route.isRetired && canEdit && (
            <ConfirmCancelButton
              handleConfirm={retireRoute}
              modalTitle="Retire route?"
              modalBody="Retiring this route will prevent it from being added to any sessions."
              buttonText="Retire route"
              buttonProps={{ variant: 'danger' }}
              buttonBlock={true}
            />
          )}
          {showEditModal && renderEditModal()}
          {showVideoModal && renderVideoModal()}
        </Col>
        <Col md="2" />
      </Row>
    </Container>
  )
}

export default RoutePage
