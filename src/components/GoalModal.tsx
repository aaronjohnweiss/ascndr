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
import { Goal, GOAL_CATEGORIES, GoalCategory, isGoalCategory, WorkoutGoal } from '../types/Goal'
import moment from 'moment'
import { getUnits, prettyPrintGoalCategory } from '../helpers/goalUtils'
import { DatePicker } from '../templates/routeFields'
import { IntensityPicker } from '../templates/workoutFields'
import { WorkoutCategory } from '../types/Workout'

export const PARTIAL_MAX = 100

interface PartialFormProps {
  initialValue?: Goal
  category: GoalCategory
  updateGoal: (goal: Goal) => void
}

// TODO fix types.. need a full BaseGoal as input or need to tweak types so this can only return workout specific fields
const WorkoutGoalFields = ({ category, initialValue, updateGoal }: PartialFormProps) => {
  if (category !== 'WORKOUT_COUNT') return <></>

  const goal: Partial<WorkoutGoal> = {
    workoutCategories: [] as WorkoutCategory[],
    minIntensity: 1,
    ...initialValue,
    category,
  }

  return (
    <>
      <Form.Label>Minimum intensity</Form.Label>
      <IntensityPicker
        value={goal.minIntensity}
        onChange={val => updateGoal({ ...initialValue, minIntensity: val })}
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
  const [goal, setGoal] = useState(initialValue)

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
