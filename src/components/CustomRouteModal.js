import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import InputSlider from './InputSlider';

const CustomRouteModal = ({ handleClose, handleSubmit, show, customRoutes = [], allowPartial = true}) => {
    const [selected, setSelected] = useState(undefined);
    const [percentage, setPercentage] = useState(100);
    const submitDisabled = selected === undefined || percentage <= 0;
    return (
        <Modal show={show} onHide={handleClose}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Add custom route
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {customRoutes.map(customRoute => (
                        <Form.Check
                            id={customRoute.key}
                            key={customRoute.key}
                            type='radio'
                            checked={selected === customRoute.key}
                            onChange={() => setSelected(customRoute.key)}
                            label={customRoute.value.name}
                        />
                    ))}
                    {allowPartial && (
                        <>
                            <Form.Label className='grade-modal-label'>Progress</Form.Label>
                            <InputSlider min={0} max={100} step={25} value={percentage} onChange={setPercentage}
                                         toString={p => `${p}%`} />
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" disabled={submitDisabled} onClick={() => handleSubmit({key: selected, percentage})}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default CustomRouteModal