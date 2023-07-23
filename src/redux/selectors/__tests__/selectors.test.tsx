import { DatabaseState, State } from '../selectors'
import { defaultGym } from '../../../types/Gym'
import { defaultUser } from '../../../types/User'
import { defaultRoute } from '../../../types/Route'
import { defaultSession } from '../../../types/Session'
import { defaultWorkout } from '../../../types/Workout'

import { useAppSelector } from '../../index'
import { Filterable, ParameterizedSelector } from '../types'
import { OrderedList } from '../../../types/Firebase'

jest.mock('../../index', () => ({
  useAppSelector: jest.fn(),
}))

jest.mock('react-redux-firebase', () => ({
  ...jest.requireActual('react-redux-firebase'),
  useFirebaseConnect: jest.fn(),
}))

const mockAppSelector = useAppSelector as jest.Mock
describe('selectors', () => {
  describe('DatabaseState', () => {
    const followerUser = defaultUser({ uid: 'friendUid' })
    const user = defaultUser({ uid: 'selfUid', friends: [followerUser.uid] })
    const followingUser = defaultUser({ uid: 'followerUid', friends: [user.uid] })
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

    const workout = defaultWorkout({
      uid: user.uid,
    })
    const sessionKey = 'sessionA'
    const badUid = 'badUid'
    const badGymKey = 'badGym'
    const badSessionKey = 'badSession'
    const badRouteKey = 'badRoute'
    const mockState: State = {
      gyms: [
        {
          key: gymKey,
          value: gym,
        },
        {
          key: badGymKey,
          value: defaultGym({ owner: badUid }),
        },
      ],
      routes: [
        {
          key: routeKey,
          value: route,
        },
        {
          key: badRouteKey,
          value: defaultRoute({ gymId: badGymKey }),
        },
      ],
      sessions: [
        {
          key: sessionKey,
          value: session,
        },
        {
          key: badSessionKey,
          value: defaultSession({ uid: badUid, gymId: badGymKey, startTime: 0 }),
        },
      ],
      users: [
        {
          key: 'userA',
          value: user,
        },
        {
          key: 'userB',
          value: followerUser,
        },
        {
          key: 'userC',
          value: followingUser,
        },
        {
          key: 'badUserKey',
          value: defaultUser({ uid: badUid }),
        },
      ],
      workouts: [
        {
          key: 'workoutA',
          value: workout,
        },
        {
          key: 'badWorkout',
          value: defaultWorkout({ uid: badUid }),
        },
      ],
    }

    const mockStore = {
      firebase: { ordered: mockState },
    }

    mockAppSelector.mockImplementation(f => f(mockStore))

    const state = new DatabaseState()

    interface TestCase<T extends Filterable = any> {
      type: string
      getter: ParameterizedSelector<T, OrderedList<T>>
      expected: T
      tests: {
        filter: string
        matchingValue: string
        missingValue: string
      }[]
    }

    describe.each([
      {
        type: 'gym',
        getter: state.gyms.getOrdered,
        expected: gym,
        tests: [
          { filter: 'owner', matchingValue: user.uid, missingValue: followerUser.uid },
          { filter: 'editor', matchingValue: followerUser.uid, missingValue: badUid },
          { filter: 'viewer', matchingValue: followingUser.uid, missingValue: followerUser.uid },
        ],
      },
      {
        type: 'route',
        getter: state.routes.getOrdered,
        expected: route,
        tests: [
          { filter: 'gym', matchingValue: gymKey, missingValue: badGymKey },
          { filter: 'session', matchingValue: sessionKey, missingValue: badSessionKey },
          { filter: 'viewer', matchingValue: user.uid, missingValue: followerUser.uid },
        ],
      },
      {
        type: 'session',
        getter: state.sessions.getOrdered,
        expected: session,
        tests: [
          { filter: 'owner', matchingValue: user.uid, missingValue: followerUser.uid },
          { filter: 'viewer', matchingValue: followingUser.uid, missingValue: followerUser.uid },
          { filter: 'gym', matchingValue: gymKey, missingValue: badGymKey },
          { filter: 'route', matchingValue: routeKey, missingValue: badRouteKey },
          { filter: 'sessionKey', matchingValue: sessionKey, missingValue: badSessionKey },
        ],
      },
      {
        type: 'user',
        getter: state.users.getOrdered,
        expected: user,
        tests: [
          { filter: 'uid', matchingValue: user.uid, missingValue: followerUser.uid },
          { filter: 'friendOf', matchingValue: followingUser.uid, missingValue: followerUser.uid },
        ],
      },
      {
        type: 'workout',
        getter: state.workouts.getOrdered,
        expected: workout,
        tests: [
          { filter: 'owner', matchingValue: user.uid, missingValue: followerUser.uid },
          { filter: 'viewer', matchingValue: followingUser.uid, missingValue: followerUser.uid },
        ],
      },
    ])('$type', ({ type, getter, expected, tests }: TestCase) => {
      describe.each(tests)('filter by $filter', ({ filter, matchingValue, missingValue }) => {
        it(`should return ${type} for ${matchingValue}`, () => {
          expect(getter([filter, matchingValue])).toContainEqual(
            expect.objectContaining({ value: expected }),
          )
        })

        it(`should not return ${type} for ${missingValue}`, () => {
          expect(getter([filter, missingValue])).not.toContainEqual(
            expect.objectContaining({ value: expected }),
          )
        })
      })
    })
  })
})
