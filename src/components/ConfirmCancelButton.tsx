import React, { Fragment } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useModalState } from '../helpers/useModalState'

interface ButtonProps {
  modalTitle: string
  modalBody?: JSX.Element | string
  handleConfirm: () => void
  buttonText: string
  buttonProps: object
  buttonBlock?: boolean
}
const ConfirmCancelButton = ({
  handleConfirm,
  modalTitle,
  modalBody,
  buttonText,
  buttonProps,
  buttonBlock,
}: ButtonProps) => {
  const [showModal, openModal, closeModal] = useModalState(false)

  const ShowModalButton = () => (
    <Button variant="danger" {...buttonProps} onClick={openModal}>
      {buttonText}
    </Button>
  )

  const WrappedButton = () =>
    buttonBlock ? (
      <div className={buttonBlock ? 'd-grid d-block' : ''}>
        <ShowModalButton />
      </div>
    ) : (
      <ShowModalButton />
    )

  return (
    <Fragment>
      <WrappedButton />
      <ConfirmCancelModal
        showModal={showModal}
        hideModal={closeModal}
        modalTitle={modalTitle}
        modalBody={modalBody}
        handleConfirm={handleConfirm}
      />
    </Fragment>
  )
}
export default ConfirmCancelButton

interface ModalProps {
  showModal: boolean
  hideModal: () => void
  modalTitle: string
  modalBody?: JSX.Element | string
  handleConfirm: () => void
}
export const ConfirmCancelModal = ({
  showModal,
  hideModal,
  modalTitle,
  modalBody,
  handleConfirm,
}: ModalProps) => (
  <Modal show={showModal} onHide={hideModal}>
    <Modal.Header closeButton>
      <Modal.Title>{modalTitle}</Modal.Title>
    </Modal.Header>
    {modalBody && <Modal.Body>{modalBody}</Modal.Body>}
    <Modal.Footer>
      <Button variant="secondary" onClick={hideModal}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={() => {
          handleConfirm()
          hideModal()
        }}
      >
        Confirm
      </Button>
    </Modal.Footer>
  </Modal>
)
