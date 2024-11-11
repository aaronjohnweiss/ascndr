import { Grade } from './Grade'
import { ExtendedFirebaseInstance } from 'react-redux-firebase'
import * as H from 'history'

export type PartialCount = Record<number, number>

export interface RouteCount<KeyType> {
  count: number
  key: KeyType
  partials: PartialCount
}

export interface Session {
  _type: 'session'
  uid: string
  gymId: string
  startTime: number
  endTime?: number
  customRoutes: RouteCount<string>[]
  standardRoutes: RouteCount<Grade>[]
}

export type FirebaseSession = Pick<Session, 'uid' | 'gymId' | 'startTime'> & Partial<Session>

export const defaultSession = (part: FirebaseSession): Session => ({
  _type: 'session',
  customRoutes: [],
  standardRoutes: [],
  ...part,
})

export type FinishedSession = Session & {
  endTime: number
}

export const isFinished = (session: Session): session is FinishedSession =>
  session.endTime !== undefined

export const createSession = async ({
  gymId,
  uid,
  firebase,
  history,
}: {
  gymId: string
  uid: string
  firebase: ExtendedFirebaseInstance
  history: H.History
}) => {
  const session = defaultSession({
    gymId,
    uid,
    startTime: new Date().getTime(),
  })

  const { key } = await firebase.push('sessions', session)
  if (key) {
    history.push('/sessions/' + key)
  }
}
