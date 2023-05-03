import React from 'react'
import {connect} from 'react-redux'
import UserHome from './UserHome';
import GenericHome from './GenericHome';

const Home = ({authenticated}) => {
    if (authenticated === false) return 'Loading';
    return authenticated ? <UserHome /> : <GenericHome />;
}

function mapStateToProps(state) {
    return {authenticated: state.auth}
}

export default connect(mapStateToProps)(Home)