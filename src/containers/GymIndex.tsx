import React, {Fragment} from 'react'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import {gymFields} from '../templates/gymFields'
import GymCard from '../components/GymCard'
import {isLoaded, useFirebase} from 'react-redux-firebase'
import {getLatestSession, getSessionsForGym} from '../helpers/filterUtils';
import {useModalState} from "../helpers/useModalState";
import {getUser, useDatabase} from "../redux/selectors";
import {Gym} from "../types/Gym";

const getLatestTimeForGym = (gym, sessions) => {
    const latest = getLatestSession(getSessionsForGym(sessions, gym.key));
    return latest ? latest.value.startTime : 0;
}

export const GymIndex = () => {
    const { uid } = getUser()
    const firebaseState = useDatabase()
    const gyms = firebaseState.gyms.getOrdered(['viewer', uid])
    const sessions = firebaseState.sessions.getOrdered(['owner', uid])

    const firebase = useFirebase()

    const [showGymModal, openGymModal, hideGymModal] = useModalState()

    const handleNewGym = (gym: Partial<Gym>) => {
        firebase.push('gyms', {...gym, owner: uid})

        hideGymModal()
    }

    if (!isLoaded(gyms) || !isLoaded(sessions)) return <>Loading</>

    // Sort gyms according to latest sessions
    gyms.sort((gymA, gymB) => getLatestTimeForGym(gymB, sessions) - getLatestTimeForGym(gymA, sessions))

    return (
        <Fragment>
            {gyms.map((gym) => <GymCard gym={gym} key={gym.key}
                                               sessions={getSessionsForGym(sessions, gym.key)}/>)}
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
