import React, { useState } from 'react'
import {
  ALL_MODIFIERS,
  ALL_STYLES,
  GRADE_RANGE,
  prettyPrint,
  printModifier,
  printType,
} from '../helpers/gradeUtils'
import { Button, Form, Modal } from 'react-bootstrap'
import InputSlider from './InputSlider'
import { DecoratedGrade, RouteModifier } from '../types/Grade'
import {
  Goal,
  GOAL_CATEGORIES,
  GoalCategory,
  GoalDetails,
  isGoalCategory,
  WorkoutGoalDetails,
} from '../types/Goal'
import moment from 'moment'
import { getUnits, prettyPrintGoalCategory } from '../helpers/goalUtils'
import { DatePicker } from '../templates/routeFields'
import { CategoryPicker, IntensityPicker } from '../templates/workoutFields'
import { WorkoutCategory } from '../types/Workout'
import { Optional } from '../redux/selectors/types'

export const PARTIAL_MAX = 100

interface PartialFormProps {
  value?: GoalDetails
  category: GoalCategory
  updateGoal: (details: GoalDetails) => void
}

// TODO fix types.. need a full BaseGoal as input or need to tweak types so this can only return workout specific fields
const WorkoutGoalFields = ({ category, value, updateGoal }: PartialFormProps) => {
  console.log({ category })
  if (category !== 'WORKOUT_COUNT') return <></>

  const details: WorkoutGoalDetails = {
    workoutCategories: [] as WorkoutCategory[],
    minIntensity: 1,
    ...value,
    category,
  }

  return (
    <>
      <Form.Label>Included categories</Form.Label>
      <CategoryPicker
        value={details.workoutCategories}
        onChange={val => updateGoal({ ...details, workoutCategories: val })}
      />
      <Form.Label>Minimum intensity</Form.Label>
      <IntensityPicker
        value={details.minIntensity}
        onChange={val => updateGoal({ ...details, minIntensity: val })}
      />
    </>
  )
}

interface Props {
  handleClose: () => void
  handleSubmit: (goal: GoalWithoutOwner) => void
  show: boolean
  submitText?: string
  title: string
  initialValue?: Goal
}

export type GoalWithoutOwner = Omit<Goal, 'owner'>

const GoalModal = ({ handleClose, handleSubmit, show, submitText, title, initialValue }: Props) => {
  const [category, setCategory] = useState(initialValue?.category || 'ACTIVITY_COUNT')
  const [isShared, setIsShared] = useState(true)
  const [startTime, setStartTime] = useState(moment.now())
  const [endTime, setEndTime] = useState(moment.now())
  const [target, setTarget] = useState(initialValue?.target)
  const [details, setDetails] = useState<Optional<GoalDetails>>(initialValue)

  const submitGoal = () => {
    // TODO
    handleClose()
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Form>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Goal type</Form.Label>
          <Form.Control
            as="select"
            defaultValue={category}
            onChange={evt =>
              isGoalCategory(evt.target.value) ? setCategory(evt.target.value) : {}
            }
          >
            {GOAL_CATEGORIES.map((cat, idx) => (
              <option key={idx} value={cat} className="text-truncate">
                {prettyPrintGoalCategory(cat)}
              </option>
            ))}
          </Form.Control>
          <Form.Label>Visibility</Form.Label> <br />
          <Form.Check
            type="radio"
            inline
            checked={!isShared}
            onChange={() => setIsShared(false)}
            label="Private"
          />
          <Form.Check
            type="radio"
            inline
            checked={isShared}
            onChange={() => setIsShared(true)}
            label="Shared"
          />
          <br />
          <Form.Label>
            Goal target {category && `(${getUnits({ category, target: 0 })})`}
          </Form.Label>
          <Form.Control
            value={target}
            onChange={evt =>
              evt.target.value === '' ? setTarget(undefined) : setTarget(Number(evt.target.value))
            }
          />
          <Form.Label>Start date</Form.Label>
          <DatePicker value={startTime} onChange={setStartTime} />
          <Form.Label>End date</Form.Label>
          <DatePicker value={endTime} onChange={setEndTime} />
          <WorkoutGoalFields category={category} value={details} updateGoal={setDetails} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitGoal}>
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default GoalModal
