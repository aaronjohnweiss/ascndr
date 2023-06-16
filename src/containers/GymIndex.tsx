import React, {Fragment} from 'react'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import {gymFields} from '../templates/gymFields'
import GymCard from '../components/GymCard'
import {isLoaded, useFirebase, useFirebaseConnect} from 'react-redux-firebase'
import {getGymsForUser, getLatestSession, getSessionsForGym, getSessionsForUser} from '../helpers/filterUtils';
import {useModalState} from "../helpers/useModalState";
import {firebaseState, getUser} from "../redux/selectors";
import {Gym} from "../types/Gym";

const getLatestTimeForGym = (gym, sessions) => {
    const latest = getLatestSession(getSessionsForGym(sessions, gym.key));
    return latest ? latest.value.startTime : 0;
}

export const GymIndex = () => {
    useFirebaseConnect([
        'gyms',
        'users',
        'sessions'
    ])

    const users = firebaseState.users.getOrdered()
    const gyms = firebaseState.gyms.getOrdered()
    const sessions = firebaseState.sessions.getOrdered()
    const { uid } = getUser()

    const firebase = useFirebase()

    const [showGymModal, openGymModal, hideGymModal] = useModalState()

    const handleNewGym = (gym: Partial<Gym>) => {
        firebase.push('gyms', {...gym, owner: uid})

        hideGymModal()
    }

    if (!isLoaded(gyms) || !isLoaded(users) || !isLoaded(sessions)) return <>Loading</>

    const gymsForUser = getGymsForUser(gyms, users, uid)
    const sessionsForUser = getSessionsForUser(sessions, uid);
    // Sort gyms according to latest sessions
    gymsForUser.sort((gymA, gymB) => getLatestTimeForGym(gymB, sessionsForUser) - getLatestTimeForGym(gymA, sessionsForUser))

    return (
        <Fragment>
            {gymsForUser.map((gym) => <GymCard gym={gym} key={gym.key}
                                               sessions={getSessionsForGym(sessionsForUser, gym.key)}/>)}
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

export default GymIndex