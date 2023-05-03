import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import EntityModal from '../components/EntityModal'
import {userNameField, userNameValidation} from '../templates/userFields'
import {isLoaded, useFirebase, useFirebaseConnect} from 'react-redux-firebase'
import {findUser, findUserKey} from '../helpers/filterUtils';
import {AppState} from "../redux/reducer";

const UserCheck = () => {
    useFirebaseConnect([
        'users'
    ])

    const { uid } = useSelector((state: AppState) => state.auth)
    const users = useSelector((state: AppState) => state.firebase.ordered.users)

    const firebase = useFirebase()

    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        if (!isLoaded(users)) return;

        const userInfo = findUser(users, uid, null);

        if (!userInfo) {
            firebase.push('users', {uid, friends: []});
        }

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