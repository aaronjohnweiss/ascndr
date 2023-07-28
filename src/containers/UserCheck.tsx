import React, { useEffect, useState } from 'react'
import EntityModal from '../components/EntityModal'
import { userNameField, userNameValidation } from '../templates/userFields'
import { isLoaded, useFirebase } from 'react-redux-firebase'
import { findUser, findUserKey } from '../helpers/filterUtils'
import { getUser, useDatabase } from '../redux/selectors/selectors'
import { getFirst } from '../redux/selectors/utils'

const UserCheck = () => {
  const { uid } = getUser()
  const firebaseState = useDatabase()
  const users = firebaseState.users.getOrdered(['uid', uid])

  const firebase = useFirebase()

  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!isLoaded(users)) return

    if (!users.length) {
      firebase.push('users', { uid, friends: [] })
    }

    const userInfo = getFirst(users)?.value

    const userName = userInfo && userInfo.name

    if (!userName) {
      setShowModal(true)
    }
  }, [users])

  if (!isLoaded(users)) return null

  const userInfo = findUser(users, uid)
  const userName = userInfo && userInfo.name

  const updateUser = user => {
    const key = findUserKey(users, uid)

    if (key) {
      firebase.update(`users/${key}`, { ...user, uid })
    }
    setShowModal(false)
  }

  return (
    <EntityModal
      show={showModal}
      handleClose={() => setShowModal(false)}
      handleSubmit={updateUser}
      fields={userNameField}
      validateState={userNameValidation(users, userName)}
      title="Set username"
      initialValues={{ ...userInfo }}
    />
  )
}

export default UserCheck
