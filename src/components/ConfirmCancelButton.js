import React, { Component, Fragment } from 'react'
import Modal from 'react-bootstrap/es/Modal'
import Button from 'react-bootstrap/es/Button'

export default class ConfirmCancelButton extends Component {
    state = {
        showModal: false
    }

    showModal= () => {
        this.setState({ showModal: true })
    }

    hideModal = () => {
        this.setState({ showModal: false })
    }

    render() {
        const { handleConfirm, handleCancel, modalTitle, modalBody, buttonText, buttonProps } = this.props
        const { showModal } = this.state

        return (
            <Fragment>
                <Button variant='danger' {...buttonProps} onClick={this.showModal}>
                    {buttonText}
                </Button>
                <Modal show={showModal} onHide={handleCancel}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {modalTitle}
                        </Modal.Title>
                    </Modal.Header>
                    {modalBody && (
                        <Modal.Body>
                            {modalBody}
                        </Modal.Body>
                    )}
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={() => {
                            handleConfirm()
                            this.hideModal()
                        }}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Fragment>
        )
    }
}