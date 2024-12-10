import React, { Fragment } from 'react'
import Button from 'react-bootstrap/Button'
import { isLoaded, useFirebase } from 'react-redux-firebase'
import { useModalState } from '../helpers/useModalState'
import { getUser, useDatabase } from '../redux/selectors/selectors'
import GoalCard from '../components/GoalCard'
import GoalModal, { GoalWithoutOwner } from '../components/GoalModal'

export const GoalIndex = () => {
  const { uid } = getUser()
  const firebaseState = useDatabase()
  const goals = firebaseState.goals.getOrdered(['viewer', uid])

  const firebase = useFirebase()

  const [showGoalModal, openGoalModal, hideGoalModal] = useModalState()

  const handleNewGoal = (goal: GoalWithoutOwner) => {
    firebase.push('goals', { ...goal, owner: uid, participants: [uid] })
    hideGoalModal()
  }

  if (!isLoaded(goals)) return <>Loading</>

  goals.sort((g1, g2) => g1.value.startTime - g2.value.startTime)

  return (
    <Fragment>
      {goals.map(goal => (
        <GoalCard goal={goal} key={goal.key} />
      ))}
      <br />
      <div className="d-grid d-block mb-4">
        <Button variant="primary" onClick={openGoalModal}>
          Add Goal
        </Button>
      </div>
      <GoalModal
        show={showGoalModal}
        handleClose={hideGoalModal}
        handleSubmit={handleNewGoal}
        title="Add goal"
      />
    </Fragment>
  )
}

export default GoalIndex
