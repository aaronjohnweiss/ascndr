import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { getUserName } from '../helpers/filterUtils'
import { MultiSelect } from '../containers/StatFilters'
import {
  ActivityCalendarPreferences,
  CalendarMode,
  defaultActivityCalendarPreferences,
  User,
} from '../types/User'

export const getPreferences = (user: User): ActivityCalendarPreferences => ({
  ...defaultActivityCalendarPreferences(),
  ...((user && user.preferences && user.preferences.activityCalendar) || {}),
})

export const ActivityCalendarSettingsModal = ({
  user,
  friends,
  show,
  handleClose,
  handleSubmit,
}) => {
  const [preferences, setPreferences] = useState(getPreferences(user))

  const setPreference = name => val => setPreferences({ ...preferences, [name]: val })

  const userOptions = friends.map(u => ({
    key: u.uid,
    label: getUserName(u),
    checked: preferences.friends.includes(u.uid),
  }))

  return (
    <Modal show={show} onHide={handleClose}>
      <Form>
        <Modal.Header closeButton>
          <Modal.Title>Activity Calendar Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Check
            checked={preferences.mode === CalendarMode.FRIENDS}
            label={'Include friends'}
            onChange={evt =>
              setPreference('mode')(
                evt.target.checked ? CalendarMode.FRIENDS : CalendarMode.USER_ONLY
              )
            }
          />

          <Form.Check
            checked={preferences.includeWorkouts}
            label={'Include workouts'}
            onChange={evt => setPreference('includeWorkouts')(evt.target.checked)}
          />

          {preferences.mode === CalendarMode.USER_ONLY && preferences.includeWorkouts && (
            <Form.Check
              checked={preferences.splitWorkouts}
              label={'Split workouts by type'}
              onChange={evt => setPreference('splitWorkouts')(evt.target.checked)}
            />
          )}

          {preferences.mode === CalendarMode.FRIENDS && (
            <>
              <Form.Label>Friends to Include</Form.Label>
              <MultiSelect options={userOptions} onChange={setPreference('friends')} />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleSubmit(preferences)}>
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
