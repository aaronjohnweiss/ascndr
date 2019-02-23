import React, { Component } from 'react'
import Modal from 'react-bootstrap/es/Modal'
import Button from 'react-bootstrap/es/Button'
import Form from 'react-bootstrap/Form'

export default class NewGymModal extends Component {
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

    render() {
        const { handleClose, handleSubmit } = this.props

        return <Modal show={this.props.show} onHide={handleClose}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Add New Gym
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>Gym Name</Form.Label>
                    <Form.Control placeholder='Name..' onChange={this.onChange('name').bind(this)}/>
                    <Form.Label>Gym Location</Form.Label>
                    <Form.Control type='text' placeholder='Location..' onChange={this.onChange('location').bind(this)}/>
                    <Form.Label>Average Wall Height (feet)</Form.Label>
                    <Form.Control type='number' placeholder='Height..' onChange={this.onChange('height').bind(this)}/>
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