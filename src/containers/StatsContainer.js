import React from 'react'
import { firebaseConnect, isLoaded } from 'react-redux-firebase'
import { compose } from 'redux'
import { connect } from 'react-redux'
import GradeHistogram from '../components/GradeHistogram'
import { Link, Route, Switch, useLocation } from 'react-router-dom'
import resolveUsers from '../helpers/resolveUsers'
import StatsIndex from '../components/StatsIndex';
import { toObj } from '../helpers/objectConverters';
import { FaChevronLeft } from 'react-icons/fa';
import { BOULDER, TOP_ROPE } from '../helpers/gradeUtils';
import GradeHistory from '../components/GradeHistory';

const filterByKeys = (data, keys) => {
    if (!data) return [];
    if (!keys || !keys.length) return data;
    return data.filter(({key}) => keys.includes(key));
};

const StatsHeader = ({search}) => (
    <Link to={`/stats${search}`}><FaChevronLeft />Stats</Link>
);

const StatsContainer = ({auth, routes, sessions, groups, users, gyms}) => {
    const search = useLocation().search;
    const query = new URLSearchParams(search);

    if (!isLoaded(routes, sessions, groups, users, gyms)) return 'Loading';

    let allowedGroups = filterByKeys(groups, query.getAll('groups'));

    let allowedSessions = sessions;
    let allowedGyms = gyms;
    if (query.has('gyms')) {
        const gymsFromQuery = query.getAll('gyms');
        // Filter sessions based on gym ids
        allowedSessions = allowedSessions.filter(session => gymsFromQuery.includes(session.value.gymId));
        // Filter groups so that they are for the provided gyms
        allowedGyms = filterByKeys(gyms, gymsFromQuery);
        const groupsForGyms = allowedGyms.map(gym => gym.value.groupId);
        allowedGroups = allowedGroups.filter(({key}) => groupsForGyms.includes(key));
    }

    let allowedUids = [...new Set(allowedGroups.map(group => group.value).filter(group => group.users.includes(auth.uid)).flatMap(group => group.users))];
    if (query.has('uids')) {
        const uidsFromQuery = query.getAll('uids');
        allowedUids = allowedUids.filter(uid => uidsFromQuery.includes(uid));
    }

    allowedSessions = allowedSessions.filter(session => allowedUids.includes(session.value.uid));

    const allowedUsers = resolveUsers(users && users.map(user => user.value) || [], allowedUids);

    const filterProps = {
        gyms: toObj(allowedGyms),
        users: allowedUsers.reduce((obj, user) => ({...obj, [user.uid]: user}), {}),
        routes,
        sessions: toObj(allowedSessions)
    };

    if (query.has('allowedTypes')) {
        filterProps.allowedTypes = query.getAll('allowedTypes');
    } else {
        filterProps.allowedTypes = [BOULDER, TOP_ROPE];
    }

    if (query.has('allowSuffixes')) {
        filterProps.allowSuffixes = query.get('allowSuffixes');
    } else {
        filterProps.allowSuffixes = false;
    }

    return (
        <Switch>
            <Route exact path={'/stats'}><StatsIndex {...filterProps} /></Route>
            <>
                <StatsHeader search={search} />
                <Route exact path={'/stats/gradeHistogram'}><GradeHistogram {...filterProps} /></Route>
                <Route exact path={'/stats/gradeHistory'}><GradeHistory {...filterProps} /></Route>
            </>
        </Switch>
    );
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
};

export default compose(
    firebaseConnect([
        {path: 'gyms'},
        {path: 'routes'},
        {path: 'sessions'},
        {path: 'groups'},
        {path: 'users'}
    ]),
    connect(mapStateToProps)
)(StatsContainer)
