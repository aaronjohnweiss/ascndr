import React from 'react'
import {isLoaded, useFirebaseConnect} from 'react-redux-firebase'
import GradeHistogram, {GradeChartProps} from '../components/GradeHistogram'
import {Route, Switch, useLocation} from 'react-router-dom'
import StatsIndex, {StatsFilterProps} from '../components/StatsIndex';
import {toObj} from '../helpers/objectConverters';
import {FaChevronLeft} from 'react-icons/fa';
import {ALL_STYLES} from '../helpers/gradeUtils';
import GradeHistory from '../components/GradeHistory';
import StatFilters, {filtersLink} from './StatFilters';
import {Button} from 'react-bootstrap';
import {filterList, findFriends, getGymsForUser} from "../helpers/filterUtils";
import {firebaseState, getUser} from "../redux/selectors";
import {isStyle, RouteStyle} from "../types/Grade";
import {LinkContainer} from 'react-router-bootstrap'

const filterByKeys = (data, keys) => {
    if (!data) return [];
    if (!keys || !keys.length) return data;
    return data.filter(({key}) => keys.includes(key));
};

const StatsHeader = ({location}) => (
    <>
        <LinkContainer to={`/stats${location.search}`}><Button variant='link'><FaChevronLeft />Stats</Button></LinkContainer>
        <LinkContainer to={filtersLink(location)} style={{float: 'right'}}><Button>Filters</Button></LinkContainer>
    </>
);

export const getBooleanFromQuery = (query, name, valueIfMissing = false) => query.has(name) ? query.get(name) === 'true' : valueIfMissing;

const StatsContainer = () => {
    useFirebaseConnect([
        'gyms',
        'routes',
        'sessions',
        'users'
    ])

    const { uid } = getUser()
    const gyms = firebaseState.gyms.getOrdered()
    const routes = firebaseState.routes.getData()
    const sessions = firebaseState.sessions.getOrdered()
    const users = firebaseState.users.getOrdered()

    const location = useLocation();
    const query = new URLSearchParams(location.search);

    if (!isLoaded(routes) || !isLoaded(sessions) || !isLoaded(users) || !isLoaded(gyms)) return <>Loading</>;

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

    let allowedTypes: RouteStyle[]
    if (query.has('allowedTypes')) {
        allowedTypes = query.getAll('allowedTypes').filter(type => isStyle(type)) as RouteStyle[];
    } else {
        allowedTypes = [...ALL_STYLES];
    }

    const allowedUsers = filterList(users, 'uid', allowedUids);

    const filterProps: StatsFilterProps & GradeChartProps = {
        gyms: toObj(allowedGyms),
        users: allowedUsers.reduce((obj, user) => ({...obj, [user.value.uid]: user.value}), {}),
        routes,
        sessions: toObj(allowedSessions),
        allowSuffixes: getBooleanFromQuery(query, 'allowSuffixes'),
        allowPartials: getBooleanFromQuery(query, 'allowPartials', true),
        allowedTypes
    };

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

export default StatsContainer
