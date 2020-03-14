import React, { useState } from 'react'
import { BOULDER, gradeEquals, LEAD, prettyPrint, TOP_ROPE } from '../helpers/gradeUtils'
import { Button, Form, Modal } from 'react-bootstrap'

const TOP_ROPE_GRADES = Array.from(new Array(9),(x, i) => i + 6).map(difficulty => ({
    style: TOP_ROPE,
    difficulty
}));

const BOULDER_GRADES = Array.from(new Array(8), (x, i) => i).map(difficulty => ({
    style: BOULDER,
    difficulty
}));

const LEAD_GRADES = Array.from(new Array(9),(x, i) => i + 6).map(difficulty => ({
    style: LEAD,
    difficulty
}));

const GradeModal = ({ defaultStyle = TOP_ROPE, handleClose, handleSubmit, show, title }) => {

    const [style, setStyle] = useState(defaultStyle);

    const [selected, setSelected] = useState(undefined);

    const submitDisabled = selected === undefined
    const submitGrade = (modifier) => {
        const toSubmit = Object.assign({}, selected);
        if (modifier) toSubmit.modifier = modifier;
        handleSubmit(toSubmit);
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>Style</Form.Label>
                    <Form.Check key='tr' id='tr' type='radio'
                                label='Top Rope'
                                checked={style === TOP_ROPE}
                                onChange={() => {
                                    setStyle(TOP_ROPE)
                                    setSelected(undefined)
                                }}/>
                    <Form.Check key='b' id='b' type='radio'
                                label='Boulder'
                                checked={style === BOULDER}
                                onChange={() => {
                                    setStyle(BOULDER)
                                    setSelected(undefined)
                                }}/>
                    <Form.Check key='l' id='l' type='radio'
                                label='Lead'
                                checked={style === LEAD}
                                onChange={() => {
                                    setStyle(LEAD)
                                    setSelected(undefined)
                                }}/>

                    <Form.Label>Grade</Form.Label>
                    {(style === TOP_ROPE && TOP_ROPE_GRADES || style === BOULDER && BOULDER_GRADES || style === LEAD && LEAD_GRADES).map((grade, idx) => (
                        <Form.Check
                            id={idx + 1}
                            key={idx + 1}
                            type='radio'
                            checked={gradeEquals(selected, grade)}
                            onChange={() => setSelected(grade)}
                            label={prettyPrint(grade)}
                        />
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button key='-' variant="primary" disabled={submitDisabled} onClick={() => submitGrade('-')}>
                        -
                    </Button>
                    <Button key=' ' variant="primary" disabled={submitDisabled} onClick={() => submitGrade()}>
                        Even
                    </Button>
                    <Button key='+' variant="primary" disabled={submitDisabled} onClick={() => submitGrade('+')}>
                        +
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default GradeModal