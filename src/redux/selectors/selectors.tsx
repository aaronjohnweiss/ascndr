import { useAppSelector } from '../index'
import { defaultGym, Gym } from '../../types/Gym'
import { defaultRoute } from '../../types/Route'
import { defaultSession } from '../../types/Session'
import { defaultUser } from '../../types/User'
import { defaultWorkout } from '../../types/Workout'
import { useFirebaseConnect } from 'react-redux-firebase'
import { Optional } from './types'
import {
  canEditSession,
  getUserByUid,
  gymFilters,
  hasFriend,
  isFriendOf,
  routeFilters,
  sessionFilters,
  userFilters,
  workoutFilters,
} from './filters'
import { buildSelectors, withDefault } from './utils'
import firebase from 'firebase/app'

export const getUser = (): firebase.User => {
  const auth = useAppSelector(state => state.auth)
  if (!auth) {
    throw new Error('uh oh')
  }
  return auth
}

/**
 * Firebase state, with filtering capabilities
 */
export class DatabaseState {
  #state = {
    gyms: withDefault(() => useAppSelector(state => state.firebase.ordered.gyms), defaultGym),
    routes: withDefault(() => useAppSelector(state => state.firebase.ordered.routes), defaultRoute),
    sessions: withDefault(
      () => useAppSelector(state => state.firebase.ordered.sessions),
      defaultSession
    ),
    users: withDefault(() => useAppSelector(state => state.firebase.ordered.users), defaultUser),
    workouts: withDefault(
      () => useAppSelector(state => state.firebase.ordered.workouts),
      defaultWorkout
    ),
  }
  gyms = {
    ...buildSelectors(this, this.#state.gyms, gymFilters),
    // Utility function: a user can edit a gym if the owner's friends list contains the user
    canEdit: (gym: Optional<Gym>) => this.users.isFriendOf(gym?.owner),
  }
  routes = {
    ...buildSelectors(this, this.#state.routes, routeFilters),
  }
  sessions = {
    ...buildSelectors(this, this.#state.sessions, sessionFilters),
    canEdit: canEditSession,
  }
  users = {
    ...buildSelectors(this, this.#state.users, userFilters),
    // Look up by UID instead of db key
    getOne: getUserByUid(this),
    // Utility function: given a list of friendUids, returns a function that evaluates if a user is on any of those friendUids' friend lists
    isFriendOf: isFriendOf(this),
    // Utility function: given a list of friendUids, returns a function that evaluates if a user's friend list has any of those friendUids
    hasFriend: hasFriend(this),
  }
  workouts = {
    ...buildSelectors(this, this.#state.workouts, workoutFilters),
  }

  constructor() {
    useFirebaseConnect(['gyms', 'routes', 'sessions', 'users', 'workouts'])
  }
}

export const useDatabase = () => new DatabaseState()
