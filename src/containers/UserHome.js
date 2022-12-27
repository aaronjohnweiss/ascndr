import React from 'react'
import {connect} from 'react-redux'
import {firebaseConnect, isLoaded} from 'react-redux-firebase';
import {compose} from 'redux';
import {findEntry, findUser, getSessionsForUser} from '../helpers/filterUtils';
import SessionCard from '../components/SessionCard';
import moment from 'moment';
import ResponsiveSessionCalendar from '../components/ResponsiveSessionCalendar';

const UserHome = ({auth: {uid}, gyms, sessions, routes, users}) => {

    if (!isLoaded(gyms, sessions, routes, users)) return 'Loading'

    const sessionsForUser = getSessionsForUser(sessions, uid);

    const latestSession = sessionsForUser.sort((a, b) => b.value.startTime - a.value.startTime)[0];

    const gym = latestSession && findEntry(gyms, latestSession.value.gymId);

    const user = findUser(users, uid);

    const calendarCutoffDate = moment().subtract(4, 'months').startOf('week');
    return (
        <>
            <h2>Welcome{user.name ? `, ${user.name}` : ' back'}!</h2>
            <ResponsiveSessionCalendar sessions={sessionsForUser} routes={routes} minCutoffDate={calendarCutoffDate} />
            {latestSession &&
            <>
                <h3>Last Session:</h3>
                <SessionCard session={latestSession} gym={gym} user={user} routes={routes} />
            </>
            }
        </>
    )
}

const mapStateToProps = state =>
{
    return {
        auth: state.auth,
        gyms: state.firebase.ordered.gyms,
        sessions: state.firebase.ordered.sessions,
        users: state.firebase.ordered.users,
        routes: state.firebase.data.routes
    }
}

export default compose(
    firebaseConnect([
        {path: 'gyms'},
        {path: 'sessions'},
        {path: 'users'},
        {path: 'routes'}
    ]),
    connect(mapStateToProps)
)(UserHome)