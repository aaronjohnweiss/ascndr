import React from 'react'
import { isLoaded } from 'react-redux-firebase'
import GradeHistogram, { GradeChartProps } from '../components/GradeHistogram'
import { Route, Switch, useLocation } from 'react-router-dom'
import StatsIndex, { StatsFilterProps } from '../components/StatsIndex'
import { FaChevronLeft } from 'react-icons/fa'
import GradeHistory from '../components/GradeHistory'
import StatFilters, { filtersLink } from './StatFilters'
import { Button } from 'react-bootstrap'
import { getUser, useDatabase } from '../redux/selectors/selectors'
import { ALL_STYLES, isStyle, RouteStyle } from '../types/Grade'
import { Gym } from '../types/Gym'
import { User } from '../types/User'
import { FilterParam } from '../redux/selectors/types'
import { LinkContainer } from 'react-router-bootstrap'
import { getBooleanFromQuery } from '../helpers/queryParser'

const StatsHeader = ({ location }) => (
  <>
    <LinkContainer to={`/stats${location.search}`}>
      <Button variant="link">
        <FaChevronLeft />
        Stats
      </Button>
    </LinkContainer>
    <LinkContainer to={filtersLink(location)} style={{ float: 'right' }}>
      <Button>Filters</Button>
    </LinkContainer>
  </>
)

const StatsContainer = () => {
  const { uid } = getUser()
  const location = useLocation()
  const query = new URLSearchParams(location.search)

  const firebaseState = useDatabase()
  // Get all viewable gyms
  const gymParams: FilterParam<Gym>[] = [['viewer', uid]]
  // Filter by gym keys from query params if provided
  if (query.has('gyms')) {
    gymParams.push(['gymKey', query.getAll('gyms')])
  }
  const gyms = firebaseState.gyms.getData(...gymParams)
  const gymKeys = isLoaded(gyms) ? Object.keys(gyms) : undefined
  // Get all routes for the given gyms
  const routes = firebaseState.routes.getData(['gym', gymKeys])
  // Get all friends, filtered to the uids from query params if provided
  const userParams: FilterParam<User>[] = [['friendOf', uid]]
  if (query.has('uids')) {
    userParams.push(['uid', query.getAll('uids')])
  }
  const users = firebaseState.users.getOrdered(...userParams)
  const sessions = firebaseState.sessions.getData(
    ['gym', gymKeys],
    ['owner', users?.map(u => u.value.uid)],
  )

  if (!isLoaded(routes) || !isLoaded(sessions) || !isLoaded(users) || !isLoaded(gyms))
    return <>Loading</>

  let allowedTypes: RouteStyle[]
  if (query.has('allowedTypes')) {
    allowedTypes = query.getAll('allowedTypes').filter(type => isStyle(type)) as RouteStyle[]
  } else {
    allowedTypes = [...ALL_STYLES]
  }

  const filterProps: StatsFilterProps & GradeChartProps = {
    gyms,
    users: users.reduce((obj, user) => ({ ...obj, [user.value.uid]: user.value }), {}),
    routes,
    sessions,
    allowSuffixes: getBooleanFromQuery(query, 'allowSuffixes'),
    allowPartials: getBooleanFromQuery(query, 'allowPartials', true),
    allowedTypes,
  }

  return (
    <Switch>
      <Route exact path={'/stats'}>
        <StatsIndex {...filterProps} />
      </Route>
      <Route exact path={'/stats/filters'}>
        <StatFilters />
      </Route>
      <>
        <StatsHeader location={location} />
        <Route exact path={'/stats/gradeHistogram'}>
          <GradeHistogram {...filterProps} />
        </Route>
        <Route exact path={'/stats/gradeHistory'}>
          <GradeHistory {...filterProps} />
        </Route>
      </>
    </Switch>
  )
}

export default StatsContainer
