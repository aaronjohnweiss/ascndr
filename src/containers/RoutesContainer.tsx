import React from 'react'
import {isLoaded} from 'react-redux-firebase'
import {Route, Switch, useLocation} from 'react-router-dom'
import RoutesIndex, {RoutesFilterProps} from "../components/RoutesIndex";
import RouteFilters from "./RouteFilters";
import {getUser, useDatabase} from "../redux/selectors/selectors";
import {filterQueryParams} from "../helpers/queryParser";

const RoutesContainer = () => {
    const location = useLocation();
    const filterParams = filterQueryParams(location)

    const {uid} = getUser()

    const firebaseState = useDatabase()

    // Get all viewable gyms, filtered by gym keys from query params if provided
    const gyms = firebaseState.gyms.getOrdered(['viewer', uid], ...filterParams.gyms.getFilter())
    const gymKeys = gyms?.map(gym => gym.key)
    // Get all routes for the given gyms
    const routes = firebaseState.routes.getData(['gym', gymKeys])
    // Get all sessions for the given gyms. Filter to self only based on query param
    const sessions = firebaseState.sessions.getData(['gym', gymKeys], ...filterParams.selfOnly.getSessionFilter(uid))
    // Grab self only, or self and friends, depending on query param
    const users = firebaseState.users.getOrdered(...filterParams.selfOnly.getUserFilter(uid))

    if (!isLoaded(routes) || !isLoaded(sessions) || !isLoaded(users) || !isLoaded(gyms)) return <>Loading</>;

    const filterProps: RoutesFilterProps = {
        routes,
        sessions,
        users,
        sortBy: filterParams.sort.getSort(),
        allowedTypes: filterParams.allowedTypes.getValues(),
        allowPartials: filterParams.allowPartials.getValue()
    };

    return (
        <Switch>
            <Route exact path={'/routeGallery'}><RoutesIndex {...filterProps} /></Route>
            <Route exact path={'/routeGallery/filters'}><RouteFilters/></Route>
        </Switch>
    );
};

export default RoutesContainer
