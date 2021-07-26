import { Col, Form, Row } from 'react-bootstrap';
import React from 'react';


const InputSlider = ({step = 1, value, onChange = () => {}, min = 0, max = 100, toString = s => s, minLabelWidth = '4em'}) => (
    <Row className='align-items-center slider-row'>
        <Col>
            <Form.Range type='range' min={min} max={max} step={step} value={value} onChange={(evt) => onChange(Number(evt.target.value))}/>
        </Col>
        <Col xs='auto' style={{minWidth: minLabelWidth}}>{toString(value)}</Col>
    </Row>
);

export default InputSlider;