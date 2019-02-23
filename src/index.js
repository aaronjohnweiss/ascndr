import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import App from './App';
import {Provider} from 'react-redux'
import {applyMiddleware, createStore} from 'redux'
import rootReducer from './redux/reducer'
import thunkMiddleware from 'redux-thunk'

const store = createStore(rootReducer, undefined, applyMiddleware(thunkMiddleware))

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
