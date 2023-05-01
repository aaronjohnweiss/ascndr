import React, {Fragment} from 'react'
import {useSelector} from 'react-redux'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import {gymFields} from '../templates/gymFields'
import Gym from '../components/Gym'
import {isLoaded, useFirebase, useFirebaseConnect} from 'react-redux-firebase'
import {getGymsForUser, getLatestSession, getSessionsForGym, getSessionsForUser} from '../helpers/filterUtils';
import {useModalState} from "../helpers/useModalState";

const getLatestTimeForGym = (gym, sessions) => {
    const latest = getLatestSession(getSessionsForGym(sessions, gym));
    return latest ? latest.value.startTime : 0;
}

export const GymIndex = () => {
    useFirebaseConnect([
        'gyms',
        'users',
        'sessions'
    ])

    const users = useSelector(state => state.firebase.ordered.users)
    const gyms = useSelector(state => state.firebase.ordered.gyms)
    const sessions = useSelector(state => state.firebase.ordered.sessions)
    const { uid } = useSelector(state => state.auth)

    const firebase = useFirebase()

    const [showGymModal, openGymModal, hideGymModal] = useModalState()

    const handleNewGym = (gym) => {
        firebase.push('gyms', {...gym, owner: uid})

        hideGymModal()
    }

    if (!isLoaded(gyms, users)) return 'Loading'

    const gymsForUser = getGymsForUser(gyms, users, uid)
    const sessionsForUser = getSessionsForUser(sessions, uid);
    // Sort gyms according to latest sessions
    gymsForUser.sort((gymA, gymB) => getLatestTimeForGym(gymB, sessionsForUser) - getLatestTimeForGym(gymA, sessionsForUser))

    return (
        <Fragment>
            {gymsForUser.map((gym) => <Gym gym={gym} key={gym.key}
                                           sessions={getSessionsForGym(sessionsForUser, gym)}/>)}
            <br/>
            <div className="d-grid d-block mb-4">
                <Button variant='primary' onClick={openGymModal}>
                    Add Gym
                </Button>
            </div>
            <EntityModal show={showGymModal}
                         handleClose={hideGymModal}
                         handleSubmit={handleNewGym}
                         fields={gymFields}/>
        </Fragment>
    )

}

const mapStateToProps = state => {
    return {
        users: state.firebase.ordered.users,
        gyms: state.firebase.ordered.gyms,
        sessions: state.firebase.ordered.sessions,
        auth: state.auth
    }
}

export default GymIndex
