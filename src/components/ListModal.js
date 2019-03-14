import React, { Component } from 'react'
import Form from 'react-bootstrap/Form'
import { Button } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'

export default class ListModal extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    onChange(id) {
        this.setState({ selected: id })

    }

    render() {
        const { handleClose, handleSubmit, show, title, listContent } = this.props

        const submitDisabled = this.state.selected === undefined
        const submitComponent = this.props.renderSubmitButtons ? this.props.renderSubmitButtons(submitDisabled, this.state.selected) : (
            <Button variant="primary" disabled={submitDisabled} onClick={() => handleSubmit(this.state.selected)}>
                Confirm
            </Button>
        )
        return (
            <Modal show={show} onHide={handleClose}>
                <Form>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {title}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {listContent.map(listItem => (
                            <Form.Check
                                id={listItem.id}
                                key={listItem.id}
                            >
                                <Form.Check.Input type='radio'
                                                  name={title}
                                                  onChange={() => this.onChange(listItem.id)}
                                />
                                <Form.Check.Label>{listItem.label}</Form.Check.Label>
                            </Form.Check>
                        ))}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        {submitComponent}
                    </Modal.Footer>
                </Form>
            </Modal>
        )
    }
}