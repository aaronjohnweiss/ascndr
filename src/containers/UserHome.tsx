import React from 'react'
import { isLoaded } from 'react-redux-firebase'
import { findEntry, findUser, getSessionsForUser } from '../helpers/filterUtils'
import moment from 'moment'
import ResponsiveActivityCalendar from '../components/ResponsiveActivityCalendar'
import { getCalendarData } from '../helpers/activityCalendarEntries'
import { getUser, useDatabase } from '../redux/selectors/selectors'
import ActivityFeed from './ActivityFeed'

const UserHome = () => {
  const { uid } = getUser()
  const firebaseState = useDatabase()
  const gyms = firebaseState.gyms.getOrdered()
  const sessions = firebaseState.sessions.getOrdered()
  const users = firebaseState.users.getOrdered()
  const routes = firebaseState.routes.getData()
  const workouts = firebaseState.workouts.getOrdered()

  if (
    !isLoaded(gyms) ||
    !isLoaded(sessions) ||
    !isLoaded(routes) ||
    !isLoaded(users) ||
    !isLoaded(workouts)
  )
    return <>Loading</>

  const user = findUser(users, uid)

  const calendarCutoffDate = moment().subtract(4, 'months').startOf('week')

  const getData = cutoffDate =>
    getCalendarData({ user, users, sessions, routes, workouts, cutoffDate })
  return (
    <>
      <h2>Welcome{user.name ? `, ${user.name}` : ' back'}!</h2>
      <ResponsiveActivityCalendar getData={getData} minCutoffDate={calendarCutoffDate} />
      <ActivityFeed />
    </>
  )
}

export default UserHome
