import React, { useState } from 'react'
import { isLoaded, useFirebase } from 'react-redux-firebase'
import { getLatestSession, groupBy } from '../helpers/filterUtils'
import { getUser, useDatabase } from '../redux/selectors/selectors'
import { useHistory } from 'react-router-dom'
import { createSession } from '../types/Session'
import { GymPicker } from '../components/GymPicker'
import { Button, Form } from 'react-bootstrap'

export const NewSessionWizard = () => {
  const { uid } = getUser()
  const firebaseState = useDatabase()
  const gyms = firebaseState.gyms.getOrdered(['viewer', uid])
  const sessions = firebaseState.sessions.getOrdered(['owner', uid])

  const firebase = useFirebase()
  const history = useHistory()

  const [gymKey, setGymKey] = useState()

  if (!isLoaded(gyms) || !isLoaded(sessions)) return <>Loading</>

  const sessionsByGym = groupBy(sessions, 'gymId')
  // Sort gyms according to latest sessions
  gyms.sort(
    (gymA, gymB) =>
      (getLatestSession(sessionsByGym[gymB.key])?.value?.startTime || 0) -
      (getLatestSession(sessionsByGym[gymA.key])?.value?.startTime || 0),
  )

  const submitSession = () =>
    createSession({
      gymId: gymKey || '',
      uid,
      firebase,
      history,
    })

  return (
    <>
      <h2>New session</h2>
      <Form>
        <Form.Label>Select gym</Form.Label>
        <GymPicker gyms={gyms} gymId={gymKey} onChange={setGymKey} />
        <div className="d-grid d-block mt-2">
          <Button disabled={gymKey === undefined} onClick={submitSession}>
            Start session
          </Button>
        </div>
      </Form>
    </>
  )
}

export default NewSessionWizard
