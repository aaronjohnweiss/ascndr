import React, { useState } from 'react'
import {
  ALL_MODIFIERS,
  ALL_STYLES,
  GRADE_RANGE,
  prettyPrint,
  printModifier,
  printType,
  TOP_ROPE,
} from '../helpers/gradeUtils'
import { Button, Form, Modal } from 'react-bootstrap'
import InputSlider from './InputSlider'
import { DecoratedGrade, RouteModifier, RouteStyle } from '../types/Grade'

export const PARTIAL_MAX = 100

interface Props {
  defaultStyle?: RouteStyle
  handleClose: () => void
  handleSubmit: (grade: DecoratedGrade) => void
  show: boolean
  title: string
  allowPartial?: boolean
}
const GradeModal = ({
  defaultStyle = TOP_ROPE,
  handleClose,
  handleSubmit,
  show,
  title,
  allowPartial = true,
}: Props) => {
  const [style, setStyle] = useState(defaultStyle)

  const [difficulty, setDifficulty] = useState(GRADE_RANGE[defaultStyle].min)

  const [modifier, setModifier] = useState<RouteModifier>(null)

  const [percentage, setPercentage] = useState(PARTIAL_MAX)

  const submitDisabled = percentage <= 0

  const submitGrade = () => {
    const toSubmit: DecoratedGrade = { style, difficulty }
    if (percentage < PARTIAL_MAX) toSubmit.percentage = percentage
    if (modifier) toSubmit.modifier = modifier
    handleSubmit(toSubmit)
  }

  const changeStyle = style => {
    setStyle(style)
    setDifficulty(GRADE_RANGE[style].min)
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Form>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label className="grade-modal-label">Style</Form.Label>
          <br />
          {ALL_STYLES.map(styleOption => (
            <Form.Check
              key={styleOption}
              id={styleOption}
              type="radio"
              inline
              checked={styleOption === style}
              onChange={() => changeStyle(styleOption)}
              label={printType(styleOption)}
            />
          ))}
          <br />

          <Form.Label className="grade-modal-label">Grade</Form.Label>
          <InputSlider
            min={GRADE_RANGE[style].min}
            max={GRADE_RANGE[style].max}
            step={1}
            value={difficulty}
            printValue={difficulty => prettyPrint({ style, difficulty, modifier })}
            onChange={setDifficulty}
            minLabelWidth="4.5em"
          />

          <Form.Label className="grade-modal-label">Modifier</Form.Label>
          <br />
          {ALL_MODIFIERS.map(modifierOption => {
            const modifierString = printModifier(modifierOption)
            return (
              <Form.Check
                id={modifierString}
                key={modifierString}
                type="radio"
                inline
                checked={modifierOption === modifier}
                onChange={() => setModifier(modifierOption)}
                label={modifierString}
              />
            )
          })}
          <br />
          {allowPartial && (
            <>
              <Form.Label className="grade-modal-label">Progress</Form.Label>
              <InputSlider
                min={0}
                max={PARTIAL_MAX}
                step={PARTIAL_MAX / 4}
                value={percentage}
                onChange={setPercentage}
                printValue={p => `${p}%`}
                minLabelWidth="4.5em"
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={submitDisabled} onClick={submitGrade}>
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default GradeModal
