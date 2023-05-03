import React from 'react'
import {isLoaded, useFirebaseConnect} from 'react-redux-firebase'
import {useSelector} from 'react-redux'
import {Route, Switch, useLocation} from 'react-router-dom'
import {toObj} from '../helpers/objectConverters';
import {ALL_STYLES} from '../helpers/gradeUtils';
import {findFriends} from "../helpers/filterUtils";
import RoutesIndex from "../components/RoutesIndex";
import RouteFilters from "./RouteFilters";
import {AppState} from "../redux/reducer";

const defaultSort = {
    key: 'created',
    desc: true,
}

export const parseSort = query => {
    const sort = query.has('sortBy') ? query.get('sortBy').split(',').map(field => ({
        key: field.substring(1),
        desc: field.charAt(0) === '-'
    })) : []

    return [...sort, defaultSort]
}

export const getBooleanFromQuery = (query, name, valueIfMissing = false) => query.has(name) ? query.get(name) === 'true' : valueIfMissing;

const StatsContainer = () => {
    useFirebaseConnect([
        'routes',
        'sessions',
        'users'
    ])

    const { uid } = useSelector((state: AppState) => state.auth)
    const routes = useSelector((state: AppState) => state.firebase.data.routes)
    const sessions = useSelector((state: AppState) => state.firebase.ordered.sessions)
    const users = useSelector((state: AppState) => state.firebase.ordered.users)

    const location = useLocation();
    const query = new URLSearchParams(location.search);

    if (!isLoaded(routes, sessions, users)) return 'Loading';

    let allowedSessions = sessions;
    if (query.has('gyms')) {
        const gymsFromQuery = query.getAll('gyms');
        // Filter sessions based on gym ids
        allowedSessions = allowedSessions.filter(session => gymsFromQuery.includes(session.value.gymId));
    }

    const selfOnly = getBooleanFromQuery(query, 'selfOnly', true);

    let allowedUids = selfOnly ? [uid] : findFriends(users, uid)

    allowedSessions = allowedSessions.filter(session => allowedUids.includes(session.value.uid));


    const filterProps = {
        routes,
        sessions: toObj(allowedSessions),
        sortBy: parseSort(query),
    };
    if (query.has('allowedTypes')) {
        filterProps.allowedTypes = query.getAll('allowedTypes');
    } else {
        filterProps.allowedTypes = ALL_STYLES;

    }
    filterProps.allowPartials = getBooleanFromQuery(query, 'allowPartials', true);

    return (
        <Switch>
            <Route exact path={'/routeGallery'}><RoutesIndex {...filterProps} /></Route>
            <Route exact path={'/routeGallery/filters'}><RouteFilters /></Route>
        </Switch>
    );
};

export default StatsContainer
