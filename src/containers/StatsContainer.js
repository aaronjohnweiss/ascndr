import React from 'react'
import {firebaseConnect, isLoaded} from 'react-redux-firebase'
import {compose} from 'redux'
import {connect} from 'react-redux'
import GradeHistogram from '../components/GradeHistogram'
import {Route, Switch, useLocation} from 'react-router-dom'
import StatsIndex from '../components/StatsIndex';
import {toObj} from '../helpers/objectConverters';
import {FaChevronLeft} from 'react-icons/fa';
import {ALL_STYLES} from '../helpers/gradeUtils';
import GradeHistory from '../components/GradeHistory';
import StatFilters, {filtersLink} from './StatFilters';
import {Button} from 'react-bootstrap';
import {filterList, findFriends, getGymsForUser} from "../helpers/filterUtils";

const filterByKeys = (data, keys) => {
    if (!data) return [];
    if (!keys || !keys.length) return data;
    return data.filter(({key}) => keys.includes(key));
};

const StatsHeader = ({location}) => (
    <>
    <Button variant='link' href={`/stats${location.search}`}><FaChevronLeft />Stats</Button>
    <Button href={filtersLink(location)} style={{float: 'right'}}>Filters</Button>
    </>
);

export const getBooleanFromQuery = (query, name, valueIfMissing = false) => query.has(name) ? query.get(name) === 'true' : valueIfMissing;

const StatsContainer = ({auth: {uid}, routes, sessions, users, gyms}) => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    if (!isLoaded(routes, sessions, users, gyms)) return 'Loading';

    let allowedSessions = sessions;
    let allowedGyms = getGymsForUser(gyms, users, uid);
    if (query.has('gyms')) {
        const gymsFromQuery = query.getAll('gyms');
        // Filter sessions and gyms based on gym ids
        allowedSessions = allowedSessions.filter(session => gymsFromQuery.includes(session.value.gymId));

        allowedGyms = filterByKeys(gyms, gymsFromQuery);
    }

    let allowedUids = findFriends(users, uid)
    if (query.has('uids')) {
        const uidsFromQuery = query.getAll('uids');
        allowedUids = allowedUids.filter(uid => uidsFromQuery.includes(uid));
    }

    allowedSessions = allowedSessions.filter(session => allowedUids.includes(session.value.uid));

    const allowedUsers = filterList(users, 'uid', allowedUids);

    const filterProps = {
        gyms: toObj(allowedGyms),
        users: allowedUsers.reduce((obj, user) => ({...obj, [user.value.uid]: user.value}), {}),
        routes,
        sessions: toObj(allowedSessions)
    };

    if (query.has('allowedTypes')) {
        filterProps.allowedTypes = query.getAll('allowedTypes');
    } else {
        filterProps.allowedTypes = ALL_STYLES;
    }

    filterProps.allowSuffixes = getBooleanFromQuery(query, 'allowSuffixes');
    filterProps.allowPartials = getBooleanFromQuery(query, 'allowPartials', true);

    return (
        <Switch>
            <Route exact path={'/stats'}><StatsIndex {...filterProps} /></Route>
            <Route exact path={'/stats/filters'}><StatFilters /></Route>
            <>
                <StatsHeader location={location} />
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
        users: state.firebase.ordered.users
    }
};

export default compose(
    firebaseConnect([
        {path: 'gyms'},
        {path: 'routes'},
        {path: 'sessions'},
        {path: 'users'}
    ]),
    connect(mapStateToProps)
)(StatsContainer)
