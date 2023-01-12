import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import EntityModal from '../components/EntityModal'
import {userNameField, userNameValidation} from '../templates/userFields'
import {compose} from 'redux'
import {firebaseConnect, isLoaded} from 'react-redux-firebase'
import {findUser, findUserKey} from '../helpers/filterUtils';

const UserCheck = ({auth: {uid}, users, firebase}) => {
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

const mapStateToProps = state => {
    return {
        users: state.firebase.ordered.users,
        auth: state.auth
    }
}

export default compose(
    firebaseConnect([
        {path: 'users'}
    ]),
    connect(mapStateToProps)
)(UserCheck)