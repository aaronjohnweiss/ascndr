import React from 'react'
import {useSelector} from 'react-redux'
import {isLoaded, useFirebaseConnect} from 'react-redux-firebase';
import {findEntry, findUser, getSessionsForUser} from '../helpers/filterUtils';
import SessionCard from '../components/SessionCard';
import moment from 'moment';
import ResponsiveActivityCalendar from '../components/ResponsiveActivityCalendar';
import {getCalendarData} from "../helpers/activityCalendarEntries";

const UserHome = () => {
    useFirebaseConnect([
        'gyms',
        'sessions',
        'users',
        'routes',
        'workouts'
    ])

    const { uid } = useSelector(state => state.auth)
        const gyms = useSelector(state => state.firebase.ordered.gyms)
        const sessions = useSelector(state => state.firebase.ordered.sessions)
        const users = useSelector(state => state.firebase.ordered.users)
        const routes = useSelector(state => state.firebase.data.routes)
        const workouts = useSelector(state => state.firebase.ordered.workouts)

    if (!isLoaded(gyms, sessions, routes, users, workouts)) return 'Loading'

    const sessionsForUser = getSessionsForUser(sessions, uid);

    const latestSession = sessionsForUser.sort((a, b) => b.value.startTime - a.value.startTime)[0];

    const gym = latestSession && findEntry(gyms, latestSession.value.gymId);

    const user = findUser(users, uid);

    const calendarCutoffDate = moment().subtract(4, 'months').startOf('week');

    const getData = (cutoffDate) => getCalendarData({user, users, sessions, routes, workouts, cutoffDate})
    return (
        <>
            <h2>Welcome{user.name ? `, ${user.name}` : ' back'}!</h2>
            <ResponsiveActivityCalendar getData={getData} minCutoffDate={calendarCutoffDate} />
            {latestSession &&
            <>
                <h3>Last Session:</h3>
                <SessionCard session={latestSession} gym={gym} user={user} routes={routes} />
            </>
            }
        </>
    )
}


export default UserHome