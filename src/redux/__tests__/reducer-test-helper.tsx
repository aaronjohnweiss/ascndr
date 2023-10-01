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
import { mount, ReactWrapper } from 'enzyme'
import { RouterParams, wrapWithRouter } from '../../__tests__/router-test-helper'

jest.useFakeTimers().setSystemTime(new Date('2022-12-25'))
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
export const routeKey = 'routeA'
export const session = defaultSession({
  uid: user.uid,
  gymId: gymKey,
  startTime: new Date().getTime(),
  customRoutes: [
    {
      key: routeKey,
      count: 1,
      partials: {},
    },
  ],
})
export const sessionKey = 'sessionA'

const workout = defaultWorkout({
  uid: user.uid,
})

const auth: firebase.User = {
  ...Substitute.for<firebase.User>(),
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

type ReduxParams = {
  preloadedState?: RootState
  store?: AppStore
}
export const wrapWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = defaultState,
    store = createStore(rootReducer, preloadedState),
  }: ReduxParams = {},
): { store: AppStore; wrapper: React.ReactElement } => {
  const Wrapper = ({ children }) => <Provider store={store}>{children}</Provider>

  return { store, wrapper: <Wrapper>{ui}</Wrapper> }
}

/**
 * Utility function to mount the component with predefined redux state and react router context
 * @param ui Component to render
 * @param reduxParams Redux state configuration
 * @param routerParams React router context configuration
 * @returns <li>store - Redux store
 * @returns <li>wrapper - fully wrapped mounted component
 * @returns <li>component - mounted component from within the wrapper
 */
export const mountWithProviders = (
  ui: React.ComponentType<any>,
  {
    reduxParams,
    routerParams,
  }: {
    reduxParams?: ReduxParams
    routerParams?: RouterParams
  } = {},
): {
  store: AppStore
  wrapper: ReactWrapper
  component: ReactWrapper
} => {
  const { store, wrapper } = wrapWithProviders(wrapWithRouter(ui, routerParams), reduxParams)

  const mountedWrapper = mount(wrapper)

  return {
    store,
    wrapper: mountedWrapper,
    component: mountedWrapper.find(ui),
  }
}
