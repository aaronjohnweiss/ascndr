import {combineReducers} from 'redux'
import {FirebaseReducer, firebaseReducer} from 'react-redux-firebase'
import {FETCH_USER, UserAction} from './actions'
import firebase from "firebase";
import {Gym} from "../types/Gym";
import {Route} from "../types/Route";
import {Session} from "../types/Session";
import {User} from "../types/User";
import {Workout} from "../types/Workout";

export type AuthState = false | firebase.User | null

function auth(state: AuthState = false, action: UserAction) {
    switch (action.type) {
        case FETCH_USER:
            return action.payload || null
        default:
            return state
    }
}

interface FirebaseSchema {
    gyms: Gym
    routes: Route
    sessions: Session
    users: User
    workouts: Workout
}

interface RootState {
    auth: AuthState
    firebase: FirebaseReducer.Reducer<User, FirebaseSchema>
}

const rootReducer = combineReducers<RootState>({
    auth, firebase: firebaseReducer
})

export type AppState = ReturnType<typeof rootReducer>

export default rootReducer