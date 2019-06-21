import { combineReducers } from 'redux'
import { firebaseReducer } from 'react-redux-firebase'
import { FETCH_USER } from './actions'


function auth(state = false, action) {
    switch (action.type) {
        case FETCH_USER:
            return action.payload || null
        default:
            return state
    }
}

const rootReducer = combineReducers({
    auth, firebase: firebaseReducer
})

export default rootReducer