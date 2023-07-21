import React, { Fragment, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { dateString } from '../helpers/dateUtils'

const HiatusListEntry = ({ displayNum, hiatus, onChange, onRemove }) => {
  const handleDateChange = name => evt => {
    // Add time so that the date gets set to local time zone instead of utc
    const date = new Date(`${evt.target.value}T00:00:00`).getTime()
    onChange({ ...hiatus, [name]: date })
  }
  return (
    <>
      <Row>
        <Col sm={9}>
          <h2>Hiatus {displayNum}</h2>
        </Col>
        <Col sm={3}>
          <Button style={{ float: 'right' }} variant="outline-danger" onClick={() => onRemove()}>
            -
          </Button>
        </Col>
      </Row>
      <Form.Label>Start Date</Form.Label>
      <Form.Control
        onChange={handleDateChange('startDate')}
        value={hiatus && hiatus.startDate ? dateString(hiatus.startDate) : ''}
        type="date"
      />
      <Form.Label>End Date</Form.Label>
      <Form.Control
        onChange={handleDateChange('endDate')}
        value={hiatus && hiatus.endDate ? dateString(hiatus.endDate) : ''}
        type="date"
      />
    </>
  )
}

export const sortHiatuses = hiatuses => hiatuses.sort((h1, h2) => h2.endDate - h1.endDate)

const HiatusModel = ({ value, onChange }) => {
  const [show, setShow] = useState(false)

  const [hiatuses, setHiatuses] = useState(value || [])

  React.useEffect(() => setHiatuses(value), [value])

  const addHiatus = () => {
    setHiatuses([{ endDate: Date.now() }, ...hiatuses])
  }

  const updateHiatus = updateIdx => updatedHiatus => {
    const newHiatuses = hiatuses.map((hiatus, idx) =>
      idx === updateIdx ? updatedHiatus : { ...hiatus }
    )
    setHiatuses(newHiatuses)
  }

  const removeHiatus = removeIdx => {
    const newHiatuses = hiatuses.map(hiatus => ({ ...hiatus }))
    newHiatuses.splice(removeIdx, 1)
    setHiatuses(newHiatuses)
  }

  const handleCancel = () => {
    setHiatuses(value)
    setShow(false)
  }

  const handleSubmit = () => {
    onChange(sortHiatuses(hiatuses))
    setShow(false)
  }

  return (
    <>
      <Button onClick={() => setShow(!show)} variant="link">
        Edit
      </Button>
      <Modal show={show} onHide={handleCancel}>
        <Form>
          <Modal.Header closeButton>
            <Modal.Title>Hiatuses</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button key="+" variant="primary" onClick={() => addHiatus()}>
              Add Hiatus
            </Button>
            {hiatuses && (
              <>
                {hiatuses.map((hiatus, idx) => (
                  <Fragment key={idx}>
                    <hr />
                    <HiatusListEntry
                      key={idx}
                      displayNum={hiatuses.length - idx}
                      hiatus={hiatus}
                      onChange={updateHiatus(idx)}
                      onRemove={() => removeHiatus(idx)}
                    />
                  </Fragment>
                ))}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => handleCancel()}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => handleSubmit()}>
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default HiatusModel
