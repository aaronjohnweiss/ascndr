import React from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { timeFromNow } from '../helpers/dateUtils'
import { getLatestSession } from '../helpers/filterUtils'
import { OrderedList, Persisted } from '../types/Firebase'
import { Goal } from '../types/Goal'
import { Session } from '../types/Session'
import {
  getGoalProgress,
  getGoalProgressString,
  getName,
  getTargetString,
  getUnits,
} from '../helpers/goalUtils'
import moment from 'moment'
import { User } from '../types/User'
import { Route } from '../types/Route'
import { Gym } from '../types/Gym'
import { DatabaseState } from '../redux/selectors/selectors'

const GoalCard = ({
  goal,
  uid,
  firebaseState,
}: {
  goal: Persisted<Goal>
  uid: string
  firebaseState: DatabaseState
}) => {
  const isFinished = moment(goal.value.endTime).isBefore(moment.now())

  const progress = getGoalProgress(goal.value, uid, firebaseState)

  const progressPercentage = Math.round((progress / goal.value.target) * 100)

  const pacePercentage = isFinished
    ? 100
    : (100 * (moment.now() - goal.value.startTime)) / (goal.value.endTime - goal.value.startTime)

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <Link key={goal.key} to={`/goals/${goal.key}`}>
            {getName(goal.value)}
          </Link>
          <div
            className={`float-end ${
              pacePercentage > progressPercentage ? 'text-danger' : 'text-primary'
            }`}
          >
            {progressPercentage}%
          </div>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Target: {getTargetString(goal.value)}
        </Card.Subtitle>
        <Card.Text>Completed: {getGoalProgressString(goal.value, progress)}</Card.Text>
      </Card.Body>
      <Card.Footer>
        <small className="text-muted">
          {isFinished
            ? `Finished ${timeFromNow(goal.value.endTime)}`
            : `${timeFromNow(goal.value.endTime, true)} remaining`}
        </small>
      </Card.Footer>
    </Card>
  )
}

export default GoalCard
