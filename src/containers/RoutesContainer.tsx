import React from 'react'
import { isLoaded } from 'react-redux-firebase'
import { Route, Switch, useLocation } from 'react-router-dom'
import { ALL_STYLES } from '../helpers/gradeUtils'
import RoutesIndex, { RoutesFilterProps, SORT_FIELDS, SortEntry } from '../components/RoutesIndex'
import RouteFilters from './RouteFilters'
import { getUser, useDatabase } from '../redux/selectors/selectors'
import { isStyle, RouteStyle } from '../types/Grade'
import { Gym } from '../types/Gym'
import { Session } from '../types/Session'
import { User } from '../types/User'
import { FilterParam } from '../redux/selectors/types'
import { getBooleanFromQuery } from '../helpers/queryParser'

const defaultSort = {
  key: 'created' as const,
  desc: true,
}

export const parseSort = (query: URLSearchParams): SortEntry[] => {
  const sort =
    query
      .get('sortBy')
      ?.split(',')
      .map(field => ({
        key: field.substring(1),
        desc: field.charAt(0) === '-',
      }))
      .filter(
        (sortEntry): sortEntry is SortEntry => SORT_FIELDS.findIndex(s => s === sortEntry.key) >= 0,
      ) || []

  return [...sort, defaultSort]
}

const RoutesContainer = () => {
  const location = useLocation()
  const query = new URLSearchParams(location.search)

  const { uid } = getUser()

  const firebaseState = useDatabase()

  // Get all viewable gyms
  const gymParams: FilterParam<Gym>[] = [['viewer', uid]]
  // Filter by gym keys from query params if provided
  if (query.has('gyms')) {
    gymParams.push(['gymKey', query.getAll('gyms')])
  }
  const gyms = firebaseState.gyms.getOrdered(...gymParams)
  const gymKeys = gyms?.map(gym => gym.key)
  // Get all routes for the given gyms
  const routes = firebaseState.routes.getData(['gym', gymKeys])
  const selfOnly = getBooleanFromQuery(query, 'selfOnly', true)
  // Get all sessions for the given gyms. Filter to self only based on query param
  const sessionParams: FilterParam<Session>[] = [
    ['gym', gymKeys],
    selfOnly ? ['owner', uid] : ['viewer', uid],
  ]
  const sessions = firebaseState.sessions.getData(...sessionParams)
  // Grab self only, or self and friends, depending on query param
  const userParams: FilterParam<User>[] = [selfOnly ? ['uid', uid] : ['friendOf', uid]]
  const users = firebaseState.users.getOrdered(...userParams)

  if (!isLoaded(routes) || !isLoaded(sessions) || !isLoaded(users) || !isLoaded(gyms))
    return <>Loading</>

  let allowedTypes: RouteStyle[]
  if (query.has('allowedTypes')) {
    allowedTypes = query.getAll('allowedTypes').filter(type => isStyle(type)) as RouteStyle[]
  } else {
    allowedTypes = [...ALL_STYLES]
  }

  const filterProps: RoutesFilterProps = {
    routes,
    sessions,
    users,
    sortBy: parseSort(query),
    allowedTypes,
    allowPartials: getBooleanFromQuery(query, 'allowPartials', true),
  }

  return (
    <Switch>
      <Route exact path={'/routeGallery'}>
        <RoutesIndex {...filterProps} />
      </Route>
      <Route exact path={'/routeGallery/filters'}>
        <RouteFilters />
      </Route>
    </Switch>
  )
}

export default RoutesContainer
