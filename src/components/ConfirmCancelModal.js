import React from 'react'
import Modal from 'react-bootstrap/es/Modal'
import Button from 'react-bootstrap/es/Button'
import Form from 'react-bootstrap/Form'

const ConfirmCancelModal = props => {
        const { handleConfirm, handleCancel, show, title } = props

        return <Modal show={show} onHide={handleCancel}>
            <Form>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
}

export default ConfirmCancelModal