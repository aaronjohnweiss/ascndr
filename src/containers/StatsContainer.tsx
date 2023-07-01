import React from 'react'
import {isLoaded} from 'react-redux-firebase'
import GradeHistogram, {GradeChartProps} from '../components/GradeHistogram'
import {Route, Switch, useLocation} from 'react-router-dom'
import StatsIndex, {StatsFilterProps} from '../components/StatsIndex';
import {FaChevronLeft} from 'react-icons/fa';
import GradeHistory from '../components/GradeHistory';
import StatFilters, {filtersLink} from './StatFilters';
import {Button} from 'react-bootstrap';
import {getUser, useDatabase} from "../redux/selectors/selectors";
import {filterQueryParams} from "../helpers/queryParser";

const StatsHeader = ({location}) => (
    <>
    <Button variant='link' href={`/stats${location.search}`}><FaChevronLeft />Stats</Button>
    <Button href={filtersLink(location)} style={{float: 'right'}}>Filters</Button>
    </>
);
const StatsContainer = () => {
    const { uid } = getUser()
    const location = useLocation();
    const filterParams = filterQueryParams(location);

    const firebaseState = useDatabase()
    // Get all viewable gyms, filtered by gym keys from query params if provided
    const gyms = firebaseState.gyms.getData(['viewer', uid], ...filterParams.gyms.getFilter())
    const gymKeys = isLoaded(gyms) ? Object.keys(gyms) : undefined
    // Get all routes for the given gyms
    const routes = firebaseState.routes.getData(['gym', gymKeys])
    // Get all friends, filtered to the uids from query params if provided
    const users = firebaseState.users.getOrdered(['friendOf', uid], ...filterParams.users.getFilter())
    const sessions = firebaseState.sessions.getData(['gym', gymKeys], ['owner', users?.map(u => u.value.uid)])


    if (!isLoaded(routes) || !isLoaded(sessions) || !isLoaded(users) || !isLoaded(gyms)) return <>Loading</>;

    console.log(gyms, routes, users, sessions)
    const filterProps: StatsFilterProps & GradeChartProps = {
        gyms,
        users: users.reduce((obj, user) => ({...obj, [user.value.uid]: user.value}), {}),
        routes,
        sessions,
        allowSuffixes: filterParams.allowSuffixes.getValue(),
        allowPartials: filterParams.allowPartials.getValue(),
        allowedTypes: filterParams.allowedTypes.getValues()
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
