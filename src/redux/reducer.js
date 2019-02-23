import {combineReducers} from "redux";
import data from '../data/data'

function gyms(state = data, action) {
    switch (action.type) {
        case 'ADD_GYM':
            return [...state, action.gym]
        default:
            return state
    }
}

const rootReducer = combineReducers({
    gyms
})

export default rootReducer