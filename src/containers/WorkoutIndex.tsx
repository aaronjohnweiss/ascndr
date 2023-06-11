import React, {useState} from 'react'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import {isLoaded, useFirebase, useFirebaseConnect} from 'react-redux-firebase'
import {getWorkoutsForUser} from '../helpers/filterUtils';
import Workout from "../components/Workout";
import {validateWorkoutFields, workoutFields} from "../templates/workoutFields";
import {useAppSelector} from "../redux/index"
import {getUser} from "../redux/selectors";

const WorkoutIndex = () => {
    useFirebaseConnect([
        'workouts'
    ])

    const { uid } = getUser()
    const workouts = useAppSelector(state => state.firebase.ordered.workouts)

    const firebase = useFirebase()

    const [showModal, setShowModal] = useState(false)

    const openModal = () => setShowModal(true)
    const closeModal = () => setShowModal(false)

    const addWorkout = (workout) => {
        firebase.push('workouts', { ...workout, uid, startTime: new Date().getTime()})
        closeModal()
    }

    if (!isLoaded(workouts)) return <>Loading</>

    const workoutsForUser = getWorkoutsForUser(workouts, uid)
    workoutsForUser.sort((a, b) => b.value.startTime - a.value.startTime)

    return (
        <>
            <div className="d-grid d-block mb-4">
                <Button variant='primary' onClick={openModal}>
                    Add Workout
                </Button>
            </div>
            {workoutsForUser.map((workout) => <Workout workout={workout.value} key={workout.key} />)}
            <EntityModal show={showModal}
                         handleClose={closeModal}
                         handleSubmit={addWorkout}
                         fields={workoutFields}
                         initialValues={{intensity: 1}}
                         validateState={validateWorkoutFields}
            />
        </>
    )
}

export default WorkoutIndex
