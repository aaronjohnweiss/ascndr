import React, { useState } from 'react'
import { getMinGrade, prettyPrint, printModifier, printType } from '../helpers/gradeUtils'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import InputSlider from './InputSlider'
import {
  ALL_MODIFIERS,
  ALL_STYLES,
  DecoratedGrade,
  GRADE_RANGE,
  RouteModifier,
  RouteStyle,
} from '../types/Grade'
import {
  Goal,
  GOAL_CATEGORIES,
  GoalCategory,
  GoalDetails,
  isGoalCategory,
  RouteCountGoalDetails,
  SessionGoalDetails,
  WorkoutGoalDetails,
} from '../types/Goal'
import moment from 'moment'
import { getUnits, prettyPrintGoalCategory } from '../helpers/goalUtils'
import { DatePicker } from '../templates/routeFields'
import { CategoryPicker, IntensityPicker } from '../templates/workoutFields'
import { WorkoutCategory } from '../types/Workout'
import { Optional } from '../redux/selectors/types'
import { GradeSlider } from './GradeModal'

interface PartialFormProps {
  value?: GoalDetails
  category: GoalCategory
  updateGoal: (details: GoalDetails) => void
}

const hasDetails = (category: GoalCategory) => category !== 'ACTIVITY_COUNT'

const WorkoutGoalFields = ({ category, value, updateGoal }: PartialFormProps) => {
  if (category !== 'WORKOUT_COUNT') return <></>

  const details: WorkoutGoalDetails = {
    workoutCategories: [],
    minIntensity: 1,
    ...value,
    category,
  }

  return (
    <>
      <Form.Label className="grade-modal-label">Included categories</Form.Label>
      <CategoryPicker
        value={details.workoutCategories}
        onChange={val => updateGoal({ ...details, workoutCategories: val })}
      />
      <Form.Label className="grade-modal-label">Minimum intensity</Form.Label>
      <IntensityPicker
        value={details.minIntensity}
        onChange={val => updateGoal({ ...details, minIntensity: val })}
      />
    </>
  )
}

const SessionGoalFields = ({ category, value, updateGoal }: PartialFormProps) => {
  if (category !== 'SESSION_COUNT') return <></>

  const details: SessionGoalDetails = {
    minDurationMinutes: 0,
    minRouteCount: 0,
    ...value,
    category,
  }

  const minDurationHours = Math.floor(details.minDurationMinutes / 60)
  const minDurationMinutesPart = details.minDurationMinutes % 60

  return (
    <>
      <Form.Label className="grade-modal-label">Minimum session duration</Form.Label>
      <Row>
        <Col xs={6}>
          <Form.Label>Hours</Form.Label>
          <Form.Control
            value={minDurationHours}
            min={0}
            type="number"
            onChange={evt =>
              updateGoal({
                ...details,
                minDurationMinutes: Number(evt.target.value) * 60 + minDurationMinutesPart,
              })
            }
          />
        </Col>
        <Col xs={6}>
          <Form.Label>Minutes</Form.Label>
          <Form.Control
            value={minDurationMinutesPart}
            min={0}
            type="number"
            onChange={evt =>
              updateGoal({
                ...details,
                minDurationMinutes: Number(evt.target.value) + minDurationHours * 60,
              })
            }
          />
        </Col>
      </Row>
      <Form.Label className="grade-modal-label">Minimum route count</Form.Label>
      <Form.Control
        value={details.minRouteCount}
        type="number"
        onChange={evt => updateGoal({ ...details, minRouteCount: Number(evt.target.value) })}
      />
    </>
  )
}

const RouteGoalFields = ({ category, value, updateGoal }: PartialFormProps) => {
  if (category !== 'ROUTE_COUNT') return <></>

  const defaultEntry = (style: RouteStyle) => ({ minGrade: getMinGrade(style) })

  const details: RouteCountGoalDetails = {
    styles: Object.fromEntries(ALL_STYLES.map(style => [style, defaultEntry(style)])),
    ...value,
    category,
  }

  return (
    <>
      {ALL_STYLES.map((style, idx) => {
        const minGrade = details.styles[style]?.minGrade

        return (
          <Form.Group key={idx}>
            <Form.Label className="grade-modal-label">{printType(style)}</Form.Label>
            <Form.Check
              checked={minGrade !== undefined}
              label="Included"
              onChange={evt =>
                evt.target.checked
                  ? updateGoal({
                      ...details,
                      styles: {
                        ...details.styles,
                        [style]: defaultEntry(style),
                      },
                    })
                  : updateGoal({
                      ...details,
                      styles: {
                        ...details.styles,
                        [style]: undefined,
                      },
                    })
              }
            />
            {minGrade !== undefined && (
              <>
                <Form.Label>Minimum grade</Form.Label>
                <GradeSlider
                  difficulty={minGrade.difficulty}
                  style={style}
                  onChange={newGrade =>
                    updateGoal({
                      ...details,
                      styles: {
                        ...details.styles,
                        [style]: { minGrade: { style, difficulty: newGrade } },
                      },
                    })
                  }
                />
              </>
            )}
          </Form.Group>
        )
      })}
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

export type GoalWithoutOwner = Omit<Goal, 'owner' | 'participants'>

const GoalModal = ({ handleClose, handleSubmit, show, title, initialValue }: Props) => {
  const [category, setCategory] = useState(initialValue?.category || 'ACTIVITY_COUNT')
  const [isShared, setIsShared] = useState(true)
  const [startTime, setStartTime] = useState(Date.now())
  const [durationDays, setDurationDays] = useState<number | undefined>(undefined)
  const [target, setTarget] = useState(initialValue?.target)
  const [details, setDetails] = useState<Optional<GoalDetails>>(initialValue)

  const submitGoal = () => {
    handleSubmit({
      _type: 'goal',
      category,
      startTime,
      endTime: moment(startTime)
        .add(durationDays || 1, 'days')
        .endOf('day')
        .valueOf(),
      target: target || 0,
      isShared,
      ...details,
    })
    handleClose()
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Form>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label as={'h6'} className={'mb-1'}>
            Goal type
          </Form.Label>
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
          <Form.Label className="grade-modal-label">Visibility</Form.Label> <br />
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
          <Form.Label className="grade-modal-label">
            Goal target {category && `(${getUnits({ category, target: 0 })})`}
          </Form.Label>
          <Form.Control
            value={target}
            min={0}
            type="number"
            onChange={evt =>
              evt.target.value === '' ? setTarget(undefined) : setTarget(Number(evt.target.value))
            }
          />
          <Form.Label className="grade-modal-label">Start date</Form.Label>
          <DatePicker value={startTime} onChange={setStartTime} />
          <Form.Label className="grade-modal-label">Duration (days)</Form.Label>
          <Form.Control
            value={durationDays}
            min={0}
            type="number"
            onChange={evt =>
              evt.target.value === ''
                ? setDurationDays(undefined)
                : setDurationDays(Number(evt.target.value))
            }
          />
          <WorkoutGoalFields category={category} value={details} updateGoal={setDetails} />
          <SessionGoalFields category={category} value={details} updateGoal={setDetails} />
          <RouteGoalFields category={category} value={details} updateGoal={setDetails} />
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
