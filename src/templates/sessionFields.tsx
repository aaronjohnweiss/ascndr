import { GymPicker } from '../components/GymPicker'
import React from 'react'
import { localDateTimeString } from '../helpers/dateUtils'
import { Form } from 'react-bootstrap'
import { Field } from '../components/EntityModal'
import { Session } from '../types/Session'

export const DatePicker = ({ value, onChange }) => (
  <Form.Control
    onChange={evt => onChange(new Date(evt.target.value).getTime())}
    value={value ? localDateTimeString(value) : ''}
    type="datetime-local"
  />
)

export const sessionFields = ({ gyms }): Field<Session>[] => [
  {
    title: 'Gym',
    name: 'gymId',
    options: {
      type: 'custom',
      component: ({ value, onChange }) => (
        <GymPicker gyms={gyms} gymId={value} onChange={onChange} />
      ),
    },
  },
  {
    title: 'Start Time',
    name: 'startTime',
    options: {
      type: 'custom',
      component: DatePicker,
    },
  },
  {
    title: 'End Time',
    name: 'endTime',
    options: {
      type: 'custom',
      component: DatePicker,
    },
  },
]
