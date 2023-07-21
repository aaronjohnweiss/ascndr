import { Col, Form, Row } from 'react-bootstrap'
import React from 'react'

interface Props {
  step?: number
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  printValue?: (val: number) => string
  minLabelWidth?: string
}
const InputSlider = ({
  step = 1,
  value,
  onChange,
  min = 0,
  max = 100,
  printValue = s => `${s}`,
  minLabelWidth = '4em',
}: Props) => (
  <Row className="align-items-center slider-row">
    <Col>
      <Form.Range
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={evt => onChange(Number(evt.target.value))}
      />
    </Col>
    <Col xs="auto" style={{ minWidth: minLabelWidth }}>
      {printValue(value)}
    </Col>
  </Row>
)

export default InputSlider
