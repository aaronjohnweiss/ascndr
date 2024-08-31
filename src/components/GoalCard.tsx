import React from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { timeFromNow } from '../helpers/dateUtils'
import { getLatestSession } from '../helpers/filterUtils'
import { OrderedList, Persisted } from '../types/Firebase'
import { Goal } from '../types/Goal'
import { Session } from '../types/Session'
import { getName, getTargetString, getUnits } from '../helpers/goalUtils'
import moment from 'moment'

const GoalCard = ({ goal }: { goal: Persisted<Goal> }) => {
  const isFinished = moment(goal.value.endTime).isBefore(moment.now())
  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <Link key={goal.key} to={`/goals/${goal.key}`}>
            {getName(goal.value)}
          </Link>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{getTargetString(goal.value)}</Card.Subtitle>
        <Card.Text>Todo: goal progress</Card.Text>
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
