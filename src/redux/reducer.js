import { combineReducers } from 'redux'
import { gyms as initialGyms, routes as initialRoutes, sessions as initialSessions } from '../data/data'
import { ADD_GYM, ADD_ROUTE, ADD_SESSION, FETCH_USER } from './actions'

function gyms(state = initialGyms, action) {
    switch (action.type) {
        case ADD_GYM:
            return [...state, action.gym]
        default:
            return state
    }
}

function routes(state = initialRoutes, action) {
    switch (action.type) {
        case ADD_ROUTE:
            return [...state, action.route]
        default:
            return state
    }
}

function sessions(state = initialSessions, action) {
    switch (action.type) {
        case ADD_SESSION:
            return [...state, action.session]
        default:
            return state
    }
}

function auth(state = false, action) {
    switch (action.type) {
        case FETCH_USER:
            return action.payload || null;
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    gyms, routes, sessions, auth
})

export default rootReducer