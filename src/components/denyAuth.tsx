import React from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'

export default ComposedComponent => {
  const DenyAuthentication = ({ authenticated, ...props }) => {
    const history = useHistory()
    if (authenticated) {
      history.push('/')
      return null
    } else {
      return <ComposedComponent {...props} />
    }
  }

  function mapStateToProps(state) {
    return { authenticated: state.auth }
  }

  return connect(mapStateToProps)(DenyAuthentication)
}
