import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import { isLoaded, useFirebase } from 'react-redux-firebase'
import Workout from '../components/Workout'
import { validateWorkoutFields, workoutFields } from '../templates/workoutFields'
import { getUser, useDatabase } from '../redux/selectors/selectors'

const WorkoutIndex = () => {
  const { uid } = getUser()
  const firebaseState = useDatabase()
  const workouts = firebaseState.workouts.getOrdered(['owner', uid])

  const firebase = useFirebase()

  const [showModal, setShowModal] = useState(false)

  const openModal = () => setShowModal(true)
  const closeModal = () => setShowModal(false)

  const addWorkout = workout => {
    firebase.push('workouts', { ...workout, uid, startTime: new Date().getTime() })
    closeModal()
  }

  if (!isLoaded(workouts)) return <>Loading</>

  workouts.sort((a, b) => b.value.startTime - a.value.startTime)

  return (
    <>
      <div className="d-grid d-block mb-4">
        <Button id="add-workout" variant="primary" onClick={openModal}>
          Add Workout
        </Button>
      </div>
      {workouts.map(workout => (
        <Workout workout={workout.value} key={workout.key} />
      ))}
      <EntityModal
        show={showModal}
        handleClose={closeModal}
        handleSubmit={addWorkout}
        fields={workoutFields}
        initialValues={{ intensity: 1 }}
        validateState={validateWorkoutFields}
      />
    </>
  )
}

export default WorkoutIndex
