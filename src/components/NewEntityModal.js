import React, { Component, Fragment } from 'react'
import Modal from 'react-bootstrap/es/Modal'
import Button from 'react-bootstrap/es/Button'
import Form from 'react-bootstrap/Form'

export default class NewEntityModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            name: '',
            location: '',
            height: 0
        }
    }

    onChange = (id) => (evt) => {
        this.setState({ [id]: evt.target.value })
    }

    onNumberChange = (id) => (evt) => {
        this.setState({ [id]: Number(evt.target.value) })
    }

    render() {
        const { handleClose, handleSubmit, show, fields } = this.props

        return <Modal show={show} onHide={handleClose}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Add New Gym
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {fields.map(({ title, placeholder, name, options }) => {
                        const onChange = (options && options.type === 'number' ? this.onNumberChange : this.onChange)
                        return (
                            <Fragment>
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