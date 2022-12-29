import React, {Fragment, useEffect, useState} from 'react'
import {Button, Form, Modal} from 'react-bootstrap'

const getInitialData = ({initialValues, fields}) => {
    const data = {...initialValues}

    for (let field of fields) {
        if (data[field.name] === undefined) data[field.name] = ''
    }

    return data
}

const ValidationErrors = ({validationErrors}) => validationErrors.length > 0 && <>
    {validationErrors.map((error, idx) => <Form.Text muted className='d-block' key={idx}>{error.message}</Form.Text>)}
</>

const EntityModal = ({handleClose, handleSubmit, show, fields, title, submitText, validateState, initialValues}) => {

    const [data, setData] = useState(getInitialData({initialValues, fields}) || {})

    const [doHotValidation, setDoHotValidation] = useState(false)

    const [validationErrors, setValidationErrors] = useState([])

    const checkValidation = () => {
        const validations = validateState ? validateState(data) : [];

        const failedValidations = validations.filter(validation => !validation.isValid)

        setValidationErrors(failedValidations)

        return failedValidations
    }

    useEffect(() => {
        if (doHotValidation) {
            checkValidation()
        }
    }, [doHotValidation, data])

    const onChange = (id) => (value) => {
        const newData = {
            ...data,
            [id]: value
        }
        setData(newData)
    }

    const onChangeEvent = (id) => (evt) => onChange(id)(evt.target.value)

    const onNumberChange = (id) => (evt) => onChange(id)(Number(evt.target.value))

    const onFileChange = (id) => (evt) => onChange(id)(evt.target.files[0])

    const onCheckboxChange = (id) => (evt) => onChange(id)(evt.target.checked)

    const onSubmit = () => {
        const failedValidations = checkValidation()
        setDoHotValidation(true)

        if (failedValidations.length === 0) {
            handleSubmit(data)
        }
    }

    return <Modal show={show} onHide={handleClose}>
        <Form>
            <Modal.Header closeButton>
                <Modal.Title>
                    {title || 'Add New'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {fields.map(({title, placeholder, name, options}, index) => {
                    const fieldValidationErrors = validationErrors.filter(error => error.field === name)
                    if (options && options.type === 'custom') {
                        return (
                            <Fragment key={index}>
                                <Form.Label>{title}</Form.Label>
                                <options.component value={data[name]} onChange={onChange(name)}/>
                                <ValidationErrors validationErrors={fieldValidationErrors}/>
                            </Fragment>
                        )
                    }

                    if (options && options.type === 'checkbox') {
                        return (
                            <Fragment key={index}>
                                <Form.Check checked={data[name]} label={title}
                                            onChange={onCheckboxChange(name)}/>
                                <ValidationErrors validationErrors={fieldValidationErrors}/>
                            </Fragment>
                        )
                    }

                    let onChangeForInput = onChangeEvent
                    if (options && options.type) {
                        if (options.type === 'number') {
                            onChangeForInput = onNumberChange
                        } else if (options.type === 'file') {
                            onChangeForInput = onFileChange
                        }
                    }
                    return (
                        <Fragment key={index}>
                            <Form.Label>{title}</Form.Label>
                            <Form.Control placeholder={placeholder}
                                          onChange={onChangeForInput(name)}
                                          value={(options && options.type === 'file') ? undefined : data[name]}
                                          {...options} />
                            <ValidationErrors validationErrors={fieldValidationErrors}/>
                        </Fragment>
                    )
                })}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" disabled={validationErrors.length > 0}
                        onClick={onSubmit}>
                    {submitText ? submitText : 'Submit'}
                </Button>
            </Modal.Footer>
        </Form>
    </Modal>
}

export default EntityModal