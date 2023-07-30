import rootReducer, { FirebaseSchema, RootState } from '../reducer'
import { defaultUser, User } from '../../types/User'
import firebase from 'firebase'
import { ExtendedFirebaseInstance, FirebaseReducer, useFirebase } from 'react-redux-firebase'
import { defaultGym } from '../../types/Gym'
import { defaultRoute } from '../../types/Route'
import { defaultSession } from '../../types/Session'
import { defaultWorkout } from '../../types/Workout'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { AppStore } from '../index'
import React from 'react'
import { Substitute } from '@fluffy-spoon/substitute'

jest.mock('react-redux-firebase', () => ({
  ...jest.requireActual('react-redux-firebase'),
  useFirebaseConnect: jest.fn(),
  useFirebase: jest.fn(),
}))

export const mockFirebase: ExtendedFirebaseInstance = {
  ...Substitute.for<ExtendedFirebaseInstance>(),
  update: jest.fn(),
  push: jest.fn(),
}

export const setupMockFirebase = () => {
  const mockUseFirebase = useFirebase as jest.Mock
  mockUseFirebase.mockReturnValue(mockFirebase)
  return mockUseFirebase
}

export const friends = Array.from({ length: 5 }, (_, i) =>
  defaultUser({ uid: `uid${i}`, name: `user ${i}` }),
)

export const user = defaultUser({
  uid: 'myUid',
  name: 'Mr. User',
  friends: friends.map(f => f.uid),
})
export const userKey = 'myUserKey'

const gymKey = 'gymA'
const gym = defaultGym({
  owner: user.uid,
})
const route = defaultRoute({
  gymId: gymKey,
})
const routeKey = 'routeA'
const session = defaultSession({
  uid: user.uid,
  gymId: gymKey,
  startTime: 0,
  customRoutes: [
    {
      key: routeKey,
      count: 1,
      partials: {},
    },
  ],
})
const sessionKey = 'sessionA'

const workout = defaultWorkout({
  uid: user.uid,
})

const auth: firebase.User = {
  uid: user.uid,
}

const firebaseDb = {
  gyms: [
    {
      key: gymKey,
      value: gym,
    },
  ],
  routes: [
    {
      key: routeKey,
      value: route,
    },
  ],
  sessions: [
    {
      key: sessionKey,
      value: session,
    },
  ],
  users: [
    {
      key: userKey,
      value: user,
    },
    ...friends.map(f => ({ key: `${f.uid}-key`, value: f })),
  ],
  workouts: [
    {
      key: 'workoutA',
      value: workout,
    },
  ],
}
export const defaultState: RootState = {
  auth,
  firebase: {
    ordered: firebaseDb,
  } as FirebaseReducer.Reducer<User, FirebaseSchema>,
}

export const wrapWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = defaultState,
    store = createStore(rootReducer, preloadedState),
  }: {
    preloadedState?: RootState
    store?: AppStore
  } = {},
): { store: AppStore; wrapper: React.ReactElement } => {
  const Wrapper = ({ children }) => <Provider store={store}>{children}</Provider>

  return { store, wrapper: <Wrapper>{ui}</Wrapper> }
}
