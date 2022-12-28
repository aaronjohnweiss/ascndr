import React, {Component, Fragment} from 'react'
import {Button, Form, Modal} from 'react-bootstrap'

export default class EntityModal extends Component {
    constructor(props) {
        super(props)

        this.state = { ...props.initialValues }

        for (let field of props.fields) {
            if (this.state[field.name] === undefined) this.state[field.name] = ''

        }
    }

    onChange = (id) => (value) => {
        this.setState({[id]: value})
    }

    onChangeEvent = (id) => (evt) => {
        this.setState({ [id]: evt.target.value })
    }

    onNumberChange = (id) => (evt) => {
        this.setState({ [id]: Number(evt.target.value) })
    }

    onFileChange = (id) => (evt) => {
        this.setState({ [id]: evt.target.files[0] })
    }

    onCheckboxChange = (id) => (evt) => {
        this.setState({ [id]: evt.target.checked })
    }

    render() {
        const { handleClose, handleSubmit, show, fields, title, submitText, validateState } = this.props

        return <Modal show={show} onHide={handleClose}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {title || 'Add New'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {fields.map(({ title, placeholder, name, options }, index) => {
                        if (options && options.type === 'custom') {
                            return (
                                <Fragment key={index}>
                                   <Form.Label>{title}</Form.Label>
                                    <options.component value={this.state[name]} onChange={this.onChange(name)}/>
                                </Fragment>
                            )
                        }

                        if (options && options.type === 'checkbox') {
                            return (
                                <Fragment key={index}>
                                    <Form.Check checked={this.state[name]} label={title} onChange={this.onCheckboxChange(name)}/>
                                </Fragment>
                            )
                        }

                        let onChange = this.onChangeEvent
                        if (options && options.type) {
                            if (options.type === 'number') {
                                onChange = this.onNumberChange
                            } else if (options.type === 'file') {
                                onChange = this.onFileChange
                            }
                        }
                        return (
                            <Fragment key={index}>
                                <Form.Label>{title}</Form.Label>
                                <Form.Control placeholder={placeholder}
                                              onChange={onChange(name).bind(this)}
                                              value={(options && options.type === 'file') ? undefined : this.state[name]}
                                              {...options} />
                            </Fragment>
                        )
                    })}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" disabled={!!validateState ? validateState(this.state) : false} onClick={() => handleSubmit(this.state)}>
                        {submitText ? submitText : 'Submit'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    }
}