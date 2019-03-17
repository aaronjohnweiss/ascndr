import { combineReducers } from 'redux'
import { gyms as initialGyms, routes as initialRoutes, sessions as initialSessions } from '../data/data'
import { ADD_GYM, ADD_ROUTE, ADD_SESSION, FETCH_USER, UPDATE_GYM, UPDATE_ROUTE, UPDATE_SESSION } from './actions'

function gyms(state = initialGyms, action) {
    switch (action.type) {
        case ADD_GYM:
            return [...state, action.gym]
        case UPDATE_GYM:
            return state.map(gym => {
                if (gym.id === action.gym.id) return action.gym
                return gym
            })
        default:
            return state
    }
}

function routes(state = initialRoutes, action) {
    switch (action.type) {
        case ADD_ROUTE:
            return [...state, action.route]
        case UPDATE_ROUTE:
            return state.map(route => {
                if (route.id === action.route.id) return action.route
                return route
            })
        default:
            return state
    }
}

function sessions(state = initialSessions, action) {
    switch (action.type) {
        case ADD_SESSION:
            return [...state, action.session]
        case UPDATE_SESSION:
            return state.map(session => {
                if (session.id === action.session.id) return action.session
                return session
            })
        default:
            return state
    }
}

function auth(state = false, action) {
    switch (action.type) {
        case FETCH_USER:
            return action.payload || null
        default:
            return state
    }
}

const rootReducer = combineReducers({
    gyms, routes, sessions, auth
})

export default rootReducer