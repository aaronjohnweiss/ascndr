import React, {Component, Fragment} from 'react'
import {Button, Modal} from 'react-bootstrap';

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
        const { handleConfirm, modalTitle, modalBody, buttonText, buttonProps, buttonBlock } = this.props
        const { showModal } = this.state

        const ShowModalButton = () => (
            <Button variant='danger' {...buttonProps} onClick={this.showModal}>
            {buttonText}
        </Button>
        )

        const WrappedButton = () => buttonBlock ? (
            <div className={buttonBlock ? "d-grid d-block" : ""}>
                <ShowModalButton />
            </div>
        ) : (
            <ShowModalButton />
        )

        return (
            <Fragment>
                <WrappedButton />
                <ConfirmCancelModal showModal={showModal}
                                    hideModal={this.hideModal}
                                    modalTitle={modalTitle}
                                    modalBody={modalBody}
                                    handleConfirm={handleConfirm}
                />
            </Fragment>
        )
    }
}

export const ConfirmCancelModal = ({showModal, hideModal, modalTitle, modalBody, handleConfirm}) => (
    <Modal show={showModal} onHide={hideModal}>
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
            <Button variant="secondary" onClick={hideModal}>
                Cancel
            </Button>
            <Button variant="primary" onClick={() => {
                handleConfirm()
                hideModal()
            }}>
                Confirm
            </Button>
        </Modal.Footer>
    </Modal>
)