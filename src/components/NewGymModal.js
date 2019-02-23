import React, { Component } from 'react'
import Modal from 'react-bootstrap/es/Modal'
import Button from 'react-bootstrap/es/Button'

export default class NewGymModal extends Component {
    constructor(props) {
        super(props)

        this.state = {}
    }

    render() {
        const { handleClose, handleSubmit } = this.props

        return <Modal show={this.props.show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add new gym</Modal.Title>
            </Modal.Header>
            <Modal.Body>I'm an input form, I promise</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => handleSubmit(this.state)}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    }
}