import React from 'react'
import {isLoaded, useFirebaseConnect} from 'react-redux-firebase'
import {Route, Switch, useLocation} from 'react-router-dom'
import {toObj} from '../helpers/objectConverters';
import {ALL_STYLES} from '../helpers/gradeUtils';
import {findFriends, getGymsForUser} from "../helpers/filterUtils";
import RoutesIndex, {RoutesFilterProps, SORT_FIELDS, SortEntry} from "../components/RoutesIndex";
import RouteFilters from "./RouteFilters";
import {firebaseState, getUser} from "../redux/selectors";
import {isStyle, RouteStyle} from "../types/Grade";

const defaultSort = {
    key: 'created' as const,
    desc: true,
}

export const parseSort = (query: URLSearchParams): SortEntry[] => {
    const sort = query.get('sortBy')?.split(',').map(field => ({
        key: field.substring(1),
        desc: field.charAt(0) === '-'
    })).filter((sortEntry): sortEntry is SortEntry => SORT_FIELDS.findIndex(s => s === sortEntry.key) >= 0) || []

    return [...sort, defaultSort]
}

export const getBooleanFromQuery = (query, name, valueIfMissing = false) => query.has(name) ? query.get(name) === 'true' : valueIfMissing;

const StatsContainer = () => {
    useFirebaseConnect([
        'routes',
        'sessions',
        'users',
        'gyms',
    ])

    const {uid} = getUser()
    const routes = firebaseState.routes.getOrdered()
    const sessions = firebaseState.sessions.getOrdered()
    const users = firebaseState.users.getOrdered()
    const gyms = firebaseState.gyms.getOrdered()

    const location = useLocation();
    const query = new URLSearchParams(location.search);

    if (!isLoaded(routes) || !isLoaded(sessions) || !isLoaded(users) || !isLoaded(gyms)) return <>Loading</>;

    let allowedSessions = sessions;
    let allowedRoutes = routes;

    let allowedGymIds = getGymsForUser(gyms, users, uid).map(gym => gym.key);

    if (query.has('gyms')) {
        const gymsFromQuery = query.getAll('gyms');
        allowedGymIds = allowedGymIds.filter(gymId => gymsFromQuery.includes(gymId))
    }

    // Filter sessions and routes based on gym ids
    allowedSessions = allowedSessions.filter(session => allowedGymIds.includes(session.value.gymId));
    allowedRoutes = allowedRoutes.filter(route => allowedGymIds.includes(route.value.gymId));

    const selfOnly = getBooleanFromQuery(query, 'selfOnly', true);

    const allowedUids = selfOnly ? [uid] : findFriends(users, uid)

    allowedSessions = allowedSessions.filter(session => allowedUids.includes(session.value.uid));

    let allowedTypes: RouteStyle[]
    if (query.has('allowedTypes')) {
        allowedTypes = query.getAll('allowedTypes').filter(type => isStyle(type)) as RouteStyle[];
    } else {
        allowedTypes = [...ALL_STYLES];
    }

    const filterProps: RoutesFilterProps = {
        routes: toObj(allowedRoutes),
        sessions: toObj(allowedSessions),
        users: users.filter(u => allowedUids.includes(u.value.uid)),
        sortBy: parseSort(query),
        allowedTypes,
        allowPartials: getBooleanFromQuery(query, 'allowPartials', true)
    };

    return (
        <Switch>
            <Route exact path={'/routeGallery'}><RoutesIndex {...filterProps} /></Route>
            <Route exact path={'/routeGallery/filters'}><RouteFilters/></Route>
        </Switch>
    );
};

export default StatsContainer
