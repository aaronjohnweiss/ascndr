import React, { Component, Fragment } from 'react'
import Modal from 'react-bootstrap/es/Modal'
import Button from 'react-bootstrap/es/Button'
import Form from 'react-bootstrap/Form'

export default class NewEntityModal extends Component {
    constructor(props) {
        super(props)

        this.state = {}

        for (let field of props.fields) {
            this.state[field.name] = ''
        }
    }

    onChange = (id) => (evt) => {
        this.setState({ [id]: evt.target.value })
    }

    onNumberChange = (id) => (evt) => {
        this.setState({ [id]: Number(evt.target.value) })
    }

    onFileChange = (id) => (evt) => {
        this.setState({[id]: evt.target.files[0]})
    }

    render() {
        const { handleClose, handleSubmit, show, fields } = this.props

        return <Modal show={show} onHide={handleClose}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Add New
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {fields.map(({ title, placeholder, name, options }, index) => {
                        let onChange = this.onChange
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
                                              {...options} />
                            </Fragment>
                        )
                    })}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => handleSubmit(this.state)}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    }
}