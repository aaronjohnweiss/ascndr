import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { localDateTimeString } from '../helpers/dateUtils';


const SessionModal = ({session, gyms, onChange, buttonProps}) => {

    const [show, setShow] = useState(false);

    const [updatedSession, setUpdatedSession] = useState(session || []);

    React.useEffect(() => setUpdatedSession(session), [session]);

    const handleCancel = () => {
        setUpdatedSession(session);
        setShow(false);
    }

    const handleSubmit = () => {
        onChange(updatedSession);
        setShow(false);
    }

    const updateSession = name => value => {
        const newSession = {...updatedSession, [name]: value};
        setUpdatedSession(newSession);
    }

    const handleDateTimeChange = name => evt => updateSession(name)(new Date(evt.target.value).getTime())

    return (
        <>
            <Button onClick={() => setShow(!show)} variant='primary' {...buttonProps}>
                Edit
            </Button>
            <Modal show={show} onHide={handleCancel}>
                <Form>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Session
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Label>Gym</Form.Label>
                        <Form.Control as='select' defaultValue={session.gymId} onChange={evt => updateSession('gymId')(evt.target.value)}>
                            {
                                gyms.map((gym, idx) => <option key={idx} value={gym.key} className="text-truncate">{gym.value.name + " - " + gym.value.location}</option>)
                            }
                        </Form.Control>
                        <Form.Label>Start Time</Form.Label>
                        <Form.Control onChange={handleDateTimeChange('startTime')}
                                      value={updatedSession && updatedSession.startTime ? localDateTimeString(updatedSession.startTime) : ''}
                                      type='datetime-local' />
                        <Form.Label>End Time</Form.Label>
                        <Form.Control onChange={handleDateTimeChange('endTime')}
                                      value={updatedSession && updatedSession.endTime ? localDateTimeString(updatedSession.endTime) : ''}
                                      type='datetime-local' />
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

export default SessionModal