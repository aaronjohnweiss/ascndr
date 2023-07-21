import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App'
import { Provider } from 'react-redux'
import firebase from 'firebase/app'
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import 'firebase/database'
import * as serviceWorker from './serviceWorker'
import { store } from './redux'

const rrfConfig = {
  userProfile: 'users',
}

const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
}

ReactDOM.render(
  <Provider store={store}>
    <ReactReduxFirebaseProvider {...rrfProps}>
      <App />
    </ReactReduxFirebaseProvider>
  </Provider>,
  document.getElementById('root'),
)

serviceWorker.register()
