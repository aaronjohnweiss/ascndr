import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import EntityModal from '../components/EntityModal'
import { isLoaded, useFirebase } from 'react-redux-firebase'
import { validateWorkoutFields, workoutFields } from '../templates/workoutFields'
import { getUser, useDatabase } from '../redux/selectors/selectors'
import { Card } from 'react-bootstrap'
import { Workout } from '../types/Workout'
import { Persisted } from '../types/Firebase'
import { useLocation } from 'react-router-dom'
import { getBooleanFromQuery } from '../helpers/queryParser'

const WorkoutIndex = () => {
  const { uid } = getUser()
  const firebaseState = useDatabase()
  const workouts = firebaseState.workouts.getOrdered(['owner', uid])

  const firebase = useFirebase()

  const query = new URLSearchParams(useLocation().search)

  const defaultCreateModalState = getBooleanFromQuery(query, 'new')

  const [showCreateModal, setShowCreateModal] = useState(defaultCreateModalState)
  const [editModalTarget, setShowEditModal] = useState<Persisted<Workout> | undefined>(undefined)

  const openCreateModal = () => setShowCreateModal(true)
  const closeCreateModal = () => setShowCreateModal(false)

  const openEditModal = (workout: Persisted<Workout>) => setShowEditModal(workout)
  const closeEditModal = () => setShowEditModal(undefined)

  if (!isLoaded(workouts)) return <>Loading</>

  const addWorkout = workout => {
    firebase.push('workouts', { ...workout, uid })
    closeCreateModal()
  }

  const updateWorkout = workout => {
    editModalTarget && firebase.update(`workouts/${editModalTarget.key}`, workout)
    closeEditModal()
  }

  const deleteWorkout = () => {
    editModalTarget && firebase.remove(`workouts/${editModalTarget.key}`)
    closeEditModal()
  }

  workouts.sort((a, b) => b.value.startTime - a.value.startTime)

  const WorkoutCard = ({ workout }: { workout: Persisted<Workout> }) => (
    <Card>
      <Card.Body>
        <Card.Title>
          {new Date(workout.value.startTime).toDateString()}
          <Button onClick={() => openEditModal(workout)} style={{ float: 'right' }}>
            Edit
          </Button>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Intensity: {workout.value.intensity}
        </Card.Subtitle>
        <Card.Text>{workout.value.categories.join(', ')}</Card.Text>
      </Card.Body>
    </Card>
  )

  return (
    <>
      <div className="d-grid d-block mb-4">
        <Button variant="primary" onClick={openCreateModal}>
          Add Workout
        </Button>
      </div>
      {workouts.map((workout, index) => (
        <WorkoutCard workout={workout} key={workout.key} />
      ))}
      <EntityModal
        show={showCreateModal}
        handleClose={closeCreateModal}
        handleSubmit={addWorkout}
        fields={workoutFields}
        title={'Add workout'}
        initialValues={{ intensity: 1, startTime: new Date().getTime() }}
        validateState={validateWorkoutFields}
      />
      <EntityModal
        show={editModalTarget !== undefined}
        handleClose={closeEditModal}
        handleSubmit={updateWorkout}
        handleDelete={deleteWorkout}
        title="Update workout"
        deleteTitle="Delete workout?"
        fields={workoutFields}
        initialValues={editModalTarget?.value}
        validateState={validateWorkoutFields}
      />
    </>
  )
}

export default WorkoutIndex
