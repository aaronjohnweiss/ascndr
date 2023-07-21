import React, { Fragment, useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { ConfirmCancelModal } from './ConfirmCancelButton'

const getInitialData = ({ initialValues, fields }) => {
  const data = { ...initialValues }

  for (const field of fields) {
    if (data[field.name] === undefined) data[field.name] = ''
  }

  return data
}

const ValidationErrors = ({ validationErrors }) =>
  validationErrors.length > 0 ? (
    <>
      {validationErrors.map((error, idx) => (
        <Form.Text className="d-block text-danger" key={idx}>
          {error.message}
        </Form.Text>
      ))}
    </>
  ) : (
    <></>
  )

export interface ValidationError {
  isValid: boolean
  message: string
  field: string
}
export interface Field<T> {
  title: string
  placeholder?: string
  name: keyof T
  options?:
    | {
        type: 'custom'
        component: <U>({ value, onChange }: { value: U; onChange: (val: U) => void }) => JSX.Element
      }
    | {
        type: 'file'
        accept?: string
      }
    | {
        type: 'number' | 'text' | 'checkbox'
      }
}
interface Props<T> {
  handleClose: () => void
  handleSubmit: (data: T) => void
  handleDelete?: () => void
  show: boolean
  fields: Field<T>[]
  title?: string
  submitText?: string
  validateState?: (data: T) => ValidationError[]
  initialValues?: object
}
const EntityModal = <T,>({
  handleClose,
  handleSubmit,
  handleDelete,
  show,
  fields,
  title,
  submitText,
  validateState,
  initialValues,
}: Props<T>) => {
  const [data, setData] = useState(getInitialData({ initialValues, fields }) || {})

  const [doHotValidation, setDoHotValidation] = useState(false)

  const [validationErrors, setValidationErrors] = useState([] as ValidationError[])

  const [confirmDelete, setConfirmDelete] = useState(false)

  const checkValidation = () => {
    const validations = validateState ? validateState(data) : []

    const failedValidations = validations.filter(validation => !validation.isValid)

    setValidationErrors(failedValidations)

    return failedValidations
  }

  useEffect(() => {
    if (doHotValidation) {
      checkValidation()
    }
  }, [doHotValidation, data])

  useEffect(() => {
    setData(getInitialData({ initialValues, fields }) || {})
  }, [initialValues])

  const onChange = id => value => {
    const newData = {
      ...data,
      [id]: value,
    }
    setData(newData)
  }

  const onChangeEvent = id => evt => onChange(id)(evt.target.value)

  const onNumberChange = id => evt => onChange(id)(Number(evt.target.value))

  const onFileChange = id => evt => onChange(id)(evt.target.files[0])

  const onCheckboxChange = id => evt => onChange(id)(evt.target.checked)

  const onSubmit = () => {
    const failedValidations = checkValidation()
    setDoHotValidation(true)

    if (failedValidations.length === 0) {
      handleSubmit(data)
    }
  }

  return (
    <>
      <Modal show={show && !confirmDelete} onHide={handleClose}>
        <Form>
          <Modal.Header closeButton>
            <Modal.Title>{title || 'Add New'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {fields.map(({ title, placeholder, name, options }, index) => {
              const fieldValidationErrors = validationErrors.filter(error => error.field === name)
              if (options && options.type === 'custom') {
                return (
                  <Fragment key={index}>
                    <Form.Label>{title}</Form.Label>
                    <options.component value={data[name]} onChange={onChange(name)} />
                    <ValidationErrors validationErrors={fieldValidationErrors} />
                  </Fragment>
                )
              }

              if (options && options.type === 'checkbox') {
                return (
                  <Fragment key={index}>
                    <Form.Check
                      checked={data[name]}
                      label={title}
                      onChange={onCheckboxChange(name)}
                    />
                    <ValidationErrors validationErrors={fieldValidationErrors} />
                  </Fragment>
                )
              }

              let onChangeForInput = onChangeEvent
              if (options && options.type) {
                if (options.type === 'number') {
                  onChangeForInput = onNumberChange
                } else if (options.type === 'file') {
                  onChangeForInput = onFileChange
                }
              }
              return (
                <Fragment key={index}>
                  <Form.Label>{title}</Form.Label>
                  <Form.Control
                    placeholder={placeholder}
                    onChange={onChangeForInput(name)}
                    value={options && options.type === 'file' ? undefined : data[name]}
                    {...options}
                  />
                  <ValidationErrors validationErrors={fieldValidationErrors} />
                </Fragment>
              )
            })}
          </Modal.Body>
          <Modal.Footer>
            {handleDelete && (
              <Button
                variant="danger"
                style={{ marginRight: 'auto' }}
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            )}
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" disabled={validationErrors.length > 0} onClick={onSubmit}>
              {submitText ? submitText : 'Submit'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <ConfirmCancelModal
        showModal={confirmDelete}
        hideModal={() => setConfirmDelete(false)}
        modalTitle={'Delete session?'}
        handleConfirm={() => {
          setConfirmDelete(false)
          handleDelete && handleDelete()
        }}
      />
    </>
  )
}

export default EntityModal
