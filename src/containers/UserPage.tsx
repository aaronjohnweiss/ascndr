import React, { Fragment } from 'react'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import { Col, ListGroup, Row } from 'react-bootstrap'
import {
  addFriendFields,
  userFields,
  userIdValidation,
  userNameValidation,
} from '../templates/userFields'
import { isLoaded, useFirebase } from 'react-redux-firebase'
import { distinct, findUserKey, getUserName } from '../helpers/filterUtils'
import ConfirmCancelButton from '../components/ConfirmCancelButton'
import { useModalState } from '../helpers/useModalState'
import { ActivityCalendarSettingsModal } from '../components/ActivityCalendarSettingsModal'
import { getUser, useDatabase } from '../redux/selectors/selectors'

const UserPage = () => {
  const { uid } = getUser()
  const firebaseState = useDatabase()
  const allUsers = firebaseState.users.getOrdered()
  const friends = firebaseState.users
    .getOrdered(['friendOf', uid])
    ?.filter(friend => friend.value.uid !== uid)
  const userInfo = firebaseState.users.getOne(uid)

  const firebase = useFirebase()

  const [showUserModal, openUserModal, closeUserModal] = useModalState(false)

  const [showFriendModal, openFriendModal, closeFriendModal] = useModalState(false)

  const [showCalendarModal, openCalendarModal, closeCalendarModal] = useModalState(false)

  if (!isLoaded(allUsers) || !isLoaded(friends) || !isLoaded(userInfo)) return <>Loading</>

  const userName = userInfo.name

  const handleUserUpdate = user => {
    const key = findUserKey(allUsers, uid)

    const data = { ...userInfo, ...user, uid }
    if (key) {
      firebase.update(`users/${key}`, data)
    } else {
      firebase.push('users', data)
    }
    closeUserModal()
  }

  const addFriend = ({ userValue }) => {
    let uidToAdd
    if (allUsers.map(user => user.value.uid).includes(userValue)) {
      uidToAdd = userValue
    } else {
      uidToAdd = (allUsers.map(user => user.value).find(user => user.name === userValue) || {}).uid
    }

    if (uidToAdd !== uid) {
      handleUserUpdate({ ...userInfo, friends: distinct([...(userInfo.friends || []), uidToAdd]) })
    }
    closeFriendModal()
  }

  const removeFriend = uidToRemove => {
    handleUserUpdate({
      ...userInfo,
      friends: (userInfo.friends || []).filter(friendUid => friendUid !== uidToRemove),
    })
    closeFriendModal()
  }

  const setPreferences = name => preferences => {
    handleUserUpdate({
      ...userInfo,
      preferences: { ...userInfo.preferences, [name]: preferences },
      uid,
    })
    closeCalendarModal()
  }

  return (
    <Fragment>
      <p>
        Your uid: <b>{uid}</b>
      </p>
      <div className="align-items-center">
        <Row className="align-items-center">
          <Col>
            <p className="align-middle m-0">
              Your display name: {userName ? <b>{userName}</b> : <i>Not set</i>}
            </p>
          </Col>
          <Col xs="auto">
            <Button className="float-end" onClick={openUserModal}>
              Edit User
            </Button>
          </Col>
        </Row>
      </div>
      <h3>Preferences</h3>
      <ListGroup>
        <ListGroup.Item className="align-items-center">
          <div className="align-middle float-start">Activity Calendar Settings</div>
          <Button size="sm" onClick={openCalendarModal} className="float-end">
            Edit
          </Button>
        </ListGroup.Item>
      </ListGroup>

      <h3>Friends</h3>
      <ListGroup>
        {friends.map((friend, idx) => (
          <ListGroup.Item key={idx} className="align-items-center">
            <div className="align-middle float-start">{getUserName(friend.value)}</div>
            <ConfirmCancelButton
              buttonText="-"
              buttonProps={{ size: 'sm', className: 'float-end' }}
              handleConfirm={() => removeFriend(friend.value.uid)}
              modalTitle="Remove friend"
              modalBody={`Remove ${getUserName(friend.value)} from your friends list?`}
            />
          </ListGroup.Item>
        ))}
      </ListGroup>
      <br />
      <div className="d-grid d-block">
        <Button variant="primary" onClick={openFriendModal}>
          Add Friend
        </Button>
      </div>

      <EntityModal
        show={showUserModal}
        title="Edit User"
        handleClose={closeUserModal}
        handleSubmit={handleUserUpdate}
        fields={userFields}
        validateState={userNameValidation(allUsers, userName)}
        initialValues={{ ...userInfo }}
      />

      <EntityModal
        show={showFriendModal}
        title="Add friend"
        handleClose={closeFriendModal}
        handleSubmit={addFriend}
        fields={addFriendFields}
        validateState={userIdValidation(allUsers)}
      />

      <ActivityCalendarSettingsModal
        show={showCalendarModal}
        user={userInfo}
        friends={friends}
        handleSubmit={setPreferences('activityCalendar')}
        handleClose={closeCalendarModal}
      />
    </Fragment>
  )
}

export default UserPage
