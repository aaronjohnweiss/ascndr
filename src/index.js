import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import firebase from 'firebase/app'
import { reactReduxFirebase } from 'react-redux-firebase'
import rootReducer from './redux/reducer'
import thunkMiddleware from 'redux-thunk'
import 'firebase/database'

const createStoreWithFirebase = reactReduxFirebase(firebase, {})(createStore)

const store = createStoreWithFirebase(rootReducer, undefined, applyMiddleware(thunkMiddleware))

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('root')
)
