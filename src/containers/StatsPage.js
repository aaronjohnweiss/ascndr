import React from 'react'
import { firebaseConnect, isLoaded } from 'react-redux-firebase'
import { compose } from 'redux'
import { connect } from 'react-redux'
import GradeHistogram from '../components/GradeHistogram'
import { useLocation } from 'react-router-dom'
import resolveUsers from '../helpers/resolveUsers'

const findByKeys = (data, keys)  => {
    if (!data) return [];
    if (!keys || !keys.length) return data;
    return data.filter(({key}) => keys.includes(key));
}

const StatsPage = ({auth, routes, sessions, groups, users, gyms}) => {
    const query = new URLSearchParams(useLocation().search);

    if (!isLoaded(routes, sessions, groups, users, gyms)) return 'Loading';

    let allowedGroups = findByKeys(groups, query.getAll('groups'));

    let allowedSessions = sessions;
    if (query.has('gyms')) {
        const gymsFromQuery = query.getAll('gyms');
        // Filter sessions based on gym ids
        allowedSessions = allowedSessions.filter(session => gymsFromQuery.includes(session.value.gymId));
        // Filter groups so that they are for the provided gyms
        const allowedGyms = findByKeys(gyms, gymsFromQuery);
        const groupsForGyms = allowedGyms.map(gym => gym.value.groupId);
        allowedGroups = allowedGroups.filter(({key}) => groupsForGyms.includes(key));
    }

    let allowedUids = [...new Set(allowedGroups.map(group => group.value).filter(group => group.users.includes(auth.uid)).flatMap(group => group.users))];
    if (query.has('uids')) {
        const uidsFromQuery = query.getAll('uids');
        allowedUids = allowedUids.filter(uid => uidsFromQuery.includes(uid));
    }

    const allowedUsers = resolveUsers(users && users.map(user => user.value) || [], allowedUids);

    const filterProps = {};
    if (query.has('allowedTypes')) {
        filterProps.allowedTypes = query.getAll('allowedTypes');
    }

    if (query.has('allowSuffixes')) {
        filterProps.allowSuffixes = query.getAll('allowSuffixes');
    }

    return <GradeHistogram users={allowedUsers} routes={routes} sessions={allowedSessions.map(session => session.value)} {...filterProps}/>
};

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
        gyms: state.firebase.ordered.gyms,
        routes: state.firebase.data.routes,
        sessions: state.firebase.ordered.sessions,
        groups: state.firebase.ordered.groups,
        users: state.firebase.ordered.users
    }
}

export default compose(
    firebaseConnect([
        { path: 'gyms' },
        { path: 'routes' },
        { path: 'sessions' },
        { path: 'groups' },
        { path: 'users' }
    ]),
    connect(mapStateToProps)
)(StatsPage)
