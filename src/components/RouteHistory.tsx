import React from 'react'
import { Accordion, ListGroup, ListGroupItem } from 'react-bootstrap'
import { printSplitRouteCount, splitRouteCount } from './StatsIndex'
import { sumByKey } from '../helpers/mathUtils'
import { getSessionsForUser } from '../helpers/filterUtils'
import { Link } from 'react-router-dom'

const RouteHistory = ({ routeKey, users, sessions }) => {
  return (
    <>
      <h3>Times Climbed</h3>
      <>
        {users.map((user, i) => (
          <UserRouteHistory key={i} user={user} routeKey={routeKey} sessions={sessions} />
        ))}
      </>
    </>
  )
}

const UserRouteHistory = ({ routeKey, user, sessions }) => {
  const name = user.name || user.uid
  const sessionsForUser = getSessionsForUser(sessions, user.uid).sort(
    (a, b) => b.value.startTime - a.value.startTime
  )
  const overallCount = countForRoute(routeKey, sessionsForUser, true)
  return (
    <Accordion>
      <Accordion.Item eventKey={'0'}>
        <Accordion.Header>{`${name}: ${overallCount}`}</Accordion.Header>
        <Accordion.Body>
          <ListGroup>
            {sessionsForUser.map((session, i) => (
              <SessionCountItem key={i} routeKey={routeKey} session={session} />
            ))}
          </ListGroup>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}

const SessionCountItem = ({ routeKey, session }) => {
  const count = countForRoute(routeKey, [session])
  return (
    <Link to={`/sessions/${session.key}`} style={{ textDecoration: 'none' }} key={session.key}>
      <ListGroupItem action>
        {new Date(session.value.startTime).toDateString() + `: ${count}`}
      </ListGroupItem>
    </Link>
  )
}

const countForRoute = (routeKey, sessions, highestOnly = false) => {
  const splitCount = sessions
    .flatMap(session => session.value.customRoutes)
    .filter(customRoute => customRoute.key === routeKey)
    .map(customRoute => splitRouteCount(customRoute))
    .reduce(sumByKey)

  return printSplitRouteCount(splitCount, highestOnly)
}

export default RouteHistory
