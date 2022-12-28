import React, {useState} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import {firebaseConnect, isLoaded} from 'react-redux-firebase'
import {getWorkoutsForUser} from '../helpers/filterUtils';
import Workout from "../components/Workout";
import {validateWorkoutFields, workoutFields} from "../templates/workoutFields";

const WorkoutIndex = ({auth: {uid}, workouts, firebase}) => {

    const [showModal, setShowModal] = useState(false)

    const openModal = () => setShowModal(true)
    const closeModal = () => setShowModal(false)

    const addWorkout = (workout) => {
        firebase.push('workouts', { ...workout, uid, startTime: new Date().getTime()})
        closeModal()
    }

    if (!isLoaded(workouts)) return 'Loading'

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

const mapStateToProps = state => {
    return {
        workouts: state.firebase.ordered.workouts,
        auth: state.auth
    }
}

export default compose(
    firebaseConnect([
        {path: 'workouts'},
    ]),
    connect(mapStateToProps)
)(WorkoutIndex)
