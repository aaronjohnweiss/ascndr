import { combineReducers } from 'redux'
import { FirebaseReducer, firebaseReducer } from 'react-redux-firebase'
import { FETCH_USER, UserAction } from './actions'
import firebase from 'firebase'
import { FirebaseGym } from '../types/Gym'
import { FirebaseRoute } from '../types/Route'
import { FirebaseSession } from '../types/Session'
import { FirebaseUser, User } from '../types/User'
import { FirebaseWorkout } from '../types/Workout'

export type AuthState = false | firebase.User | null

function auth(state: AuthState = false, action: UserAction) {
  switch (action.type) {
    case FETCH_USER:
      return action.payload || null
    default:
      return state
  }
}

export interface FirebaseSchema {
  gyms: FirebaseGym
  routes: FirebaseRoute
  sessions: FirebaseSession
  users: FirebaseUser
  workouts: FirebaseWorkout
}

export interface RootState {
  auth: AuthState
  firebase: FirebaseReducer.Reducer<User, FirebaseSchema>
}

const rootReducer = combineReducers<RootState>({
  auth,
  firebase: firebaseReducer,
})

export type AppState = ReturnType<typeof rootReducer>

export default rootReducer
