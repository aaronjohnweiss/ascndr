import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'

interface Props {
  handleClose: () => void
  handleSubmit: (s: string) => void
  show: boolean
  title: string
  listContent: {
    id: string
    label: string
  }[]
  renderSubmitButtons: (submitDisabled: boolean, selected: string | null) => JSX.Element
}
export const ListModal = ({
  handleClose,
  handleSubmit,
  show,
  title,
  listContent,
  renderSubmitButtons,
}: Props) => {
  const [selected, setSelected] = useState<string | null>(null)

  const submitDisabled = selected === undefined
  const submitComponent = renderSubmitButtons ? (
    renderSubmitButtons(submitDisabled, selected)
  ) : (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    <Button variant="primary" disabled={submitDisabled} onClick={() => handleSubmit(selected!)}>
      Confirm
    </Button>
  )
  return (
    <Modal show={show} onHide={handleClose}>
      <Form>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {listContent.map(listItem => (
            <Form.Check id={listItem.id} key={listItem.id}>
              <Form.Check.Input
                type="radio"
                checked={selected === listItem.id}
                onChange={() => setSelected(listItem.id)}
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
export default ListModal
