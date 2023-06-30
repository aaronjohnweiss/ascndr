import React, {useEffect, useState} from 'react'
import EntityModal from '../components/EntityModal'
import {userNameField, userNameValidation} from '../templates/userFields'
import {isLoaded, useFirebase} from 'react-redux-firebase'
import {findUser, findUserKey, userExists} from '../helpers/filterUtils';
import {getUser, useDatabase} from "../redux/selectors";

const UserCheck = () => {
    const { uid } = getUser()
    const firebaseState = useDatabase()
    const users = firebaseState.users.getOrdered()

    const firebase = useFirebase()

    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        if (!isLoaded(users)) return;

        if (!userExists(users, uid)) {
            firebase.push('users', {uid, friends: []});
        }

        const userInfo = findUser(users, uid);

        const userName = userInfo && userInfo.name;

        if (!userName) {
            setShowModal(true);
        }
    }, [users])


    if (!isLoaded(users)) return null;

    const userInfo = findUser(users, uid);
    const userName = userInfo && userInfo.name;

    const updateUser = (user) => {
        const key = findUserKey(users, uid)

        if (key) {
            firebase.update(`users/${key}`, {...user, uid});
        }
        setShowModal(false)
    }

    return (
        <EntityModal show={showModal}
                     handleClose={() => setShowModal(false)}
                     handleSubmit={updateUser}
                     fields={userNameField}
                     validateState={userNameValidation(users, userName)}
                     title='Set username'
                     initialValues={{...userInfo}}/>
    )
}

export default UserCheck