import { combineReducers } from 'redux'
import data from '../data/data'
import { ADD_GYM, ADD_ROUTE } from './actions'

function gyms(state = data, action) {
    switch (action.type) {
        case ADD_GYM:
            return [...state, action.gym]
        default:
            return state
    }
}

function routes(state = data, action) {
    switch (action.type) {
        case ADD_ROUTE:
            return [...state, action.route]
        default:
            return state
    }
}

const rootReducer = combineReducers({
    gyms, routes
})

export default rootReducer