import React from 'react'
import { compareGrades, compareSplitCounts, prettyPrint } from '../helpers/gradeUtils'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { useHistory, useLocation } from 'react-router-dom'
import { printSplitRouteCount, routeCount, splitRouteCount } from './StatsIndex'
import { pluralize, sumByKey } from '../helpers/mathUtils'
import { PARTIAL_MAX } from './GradeModal'
import { FAILED_IMAGE, PENDING_IMAGE } from '../containers/RoutePage'
import { Data, OrderedList, Persisted } from '../types/Firebase'
import { Route } from '../types/Route'
import { Session } from '../types/Session'
import { RouteStyle } from '../types/Grade'
import { entries } from '../helpers/recordUtils'
import { findUser, getUserName, groupBy } from '../helpers/filterUtils'
import { User } from '../types/User'
import { LinkContainer } from 'react-router-bootstrap'
import { toArray } from '../helpers/objectConverters'

export const SORT_FIELDS = ['count', 'time', 'project', 'grade', 'created'] as const

export type SortField = (typeof SORT_FIELDS)[number]

interface SortOption {
  label: string
  comparator: (
    r1: Persisted<RouteWithStats>,
    r2: Persisted<RouteWithStats>,
    desc: boolean
  ) => number
  display: (r: RouteWithStats, props: RoutesFilterProps, isFirst: boolean) => string | null
}

export const sortOptions: Record<SortField, SortOption> = {
  count: {
    label: 'Times climbed',
    comparator: (r1, r2, desc) =>
      (desc ? -1 : 1) * compareSplitCounts(r1.value.count, r2.value.count),
    display: (r, { allowPartials }, isFirst) =>
      `${isFirst ? 'Climbed' : 'climbed'} ${printSplitRouteCount(r.count, allowPartials)}`,
  },
  time: {
    label: 'Last climbed date',
    comparator: (r1, r2, desc) => {
      // Nulls last
      if (!r2.value.time) return -1
      if (!r1.value.time) return 1
      // Order by session time
      return (desc ? -1 : 1) * (r1.value.time - r2.value.time)
    },
    display: (r, _, isFirst) =>
      r.time
        ? `${isFirst ? 'Climbed most' : 'most'} recently on ${new Date(r.time).toDateString()}`
        : null,
  },
  project: {
    label: 'Longest project',
    comparator: (r1, r2, desc) => {
      // Nulls last
      if (!r2.value.project) return -1
      if (!r1.value.project) return 1
      // Order by project session count
      return (desc ? -1 : 1) * (r1.value.project.sessionCount - r2.value.project.sessionCount)
    },
    display: (r, { users }, isFirst) => {
      if (!r.project) return null
      const name = getUserName(findUser(users, r.project.uid))
      const count = r.project.sessionCount
      return `${isFirst ? 'Projected' : 'projected'} by ${name} for ${count} ${pluralize(
        'session',
        count
      )}`
    },
  },
  grade: {
    label: 'Grade',
    comparator: (r1, r2, desc) => (desc ? -1 : 1) * compareGrades(r1.value.grade, r2.value.grade),
    display: () => null,
  },
  created: {
    label: 'Created date',
    comparator: (r1, r2, desc) => (desc ? -1 : 1) * r1.key.localeCompare(r2.key),
    display: () => null,
  },
}

export interface SortEntry {
  key: SortField
  desc: boolean
}

export interface RoutesFilterProps {
  routes: Data<Route>
  sessions: Data<Session>
  users: OrderedList<User>
  allowedTypes: RouteStyle[]
  allowPartials: boolean
  sortBy: SortEntry[]
}

const RoutesIndex = (props: RoutesFilterProps) => {
  const { routes, sessions, allowedTypes, allowPartials, sortBy } = props
  const location = useLocation()
  const history = useHistory()
  const filterParams = location.search

  const stats = Object.entries(routes)
    .filter(([, route]) => route.grade && allowedTypes.includes(route.grade.style))
    .map(([key, route]) => [key, statsForRoute(key, route, sessions, allowPartials)] as const)
    .sort(([k1, r1], [k2, r2]) => {
      for (const { key, desc } of sortBy) {
        const compareResult =
          sortOptions[key].comparator(
            {
              key: k1,
              value: r1,
            },
            { key: k2, value: r2 },
            desc
          ) || 0
        if (compareResult !== 0) return compareResult
      }
      return 0
    })

  const cards = stats.map(([key, route], idx) => (
    <Card key={idx}>
      <Card.Img
        variant="top"
        src={
          route.picture && route.picture !== FAILED_IMAGE && route.picture !== PENDING_IMAGE
            ? route.picture
            : '/ElCap-512.png'
        }
        onClick={() => history.push(`/routes/${key}`)}
      />
      <Card.Body>
        <Card.Title>
          {route.name || 'Unnamed'} {prettyPrint(route.grade)}
        </Card.Title>
        <Card.Text>{buildCardDescription(route, props)}</Card.Text>
      </Card.Body>
    </Card>
  ))

  return (
    <>
      <Row>
        <Col xs={6}>
          <h2>Routes</h2>
        </Col>
        <Col>
          <LinkContainer to={`/routeGallery/filters${filterParams}`} style={{ float: 'right' }}>
            <Button>Filters</Button>
          </LinkContainer>
        </Col>
      </Row>
      <Row>
        {cards.map((card, idx) => (
          <Col key={idx} xs={6} sm={4} md={3} lg={2}>
            {card}
          </Col>
        ))}
      </Row>
    </>
  )
}

type RouteWithStats = Route & {
  count: Record<string, number>
  time: number | null
  project: Project | null
}
const statsForRoute = (
  routeKey: string,
  route: Route,
  sessions: Data<Session>,
  allowPartials: boolean
): RouteWithStats => {
  const sessionsForRoute = toArray(sessions).filter(s =>
    s.value.customRoutes.some(r => r.key === routeKey)
  )

  const sessionStats = sessionsForRoute
    .flatMap(session =>
      session.value.customRoutes.map(rt => [rt, session.value.startTime] as const)
    )
    .filter(([customRoute]) => customRoute.key === routeKey)
    .map(
      ([customRoute, time]) =>
        [
          allowPartials
            ? splitRouteCount(customRoute)
            : { [PARTIAL_MAX]: routeCount(customRoute, allowPartials) },
          time,
        ] as const
    )
    .reduce(
      (acc, [count, time]) => ({ count: sumByKey(acc.count, count), times: [...acc.times, time] }),
      {
        count: {} as Record<string, number>,
        times: [] as number[],
      }
    )

  return {
    ...route,
    count: sessionStats.count,
    time: sessionStats.times.length ? Math.max(...sessionStats.times) : null,
    project: calculateLongestProject(routeKey, sessionsForRoute, allowPartials),
  }
}

interface ProjectBase {
  uid: string
  sessionCount: number
}

type WorkingProject = ProjectBase & {
  isSent: false
  sentDate: undefined
}

type SentProject = ProjectBase & {
  isSent: true
  sentDate: number
}

export const isSent = (project: Project): project is SentProject => project.isSent

export type Project = WorkingProject | SentProject

const calculateLongestProject = (
  routeKey: string,
  sessionsForRoute: OrderedList<Session>,
  allowPartials: boolean
): Project | null => {
  const sessionsByUser = groupBy(sessionsForRoute, 'uid')

  return calculateProjectTimes(routeKey, sessionsByUser)
    .filter(proj => allowPartials || proj.isSent)
    .reduce(
      (longest: Project | null, x) =>
        longest != null && longest.sessionCount > x.sessionCount ? longest : x,
      null
    )
}
export const calculateProjectTimes = (
  routeKey: string,
  sessionsByUser: Record<string, OrderedList<Session>>
): Project[] => {
  return entries(sessionsByUser)
    .map(
      ([uid, sessions]) =>
        [uid, sessions.filter(s => s.value.customRoutes.some(r => r.key === routeKey))] as const
    )
    .map(([uid, sessions]) => {
      // Order sessions by oldest first
      sessions.sort((s1, s2) => s1.value.startTime - s2.value.startTime)
      // Find the leftmost (earliest) session where the route was sent
      const firstSend = sessions.findIndex(s =>
        s.value.customRoutes.some(r => r.key === routeKey && r.count >= 1)
      )

      let sessionCount, isSent, sentDate
      if (firstSend === -1) {
        sessionCount = sessions.length
        isSent = false
      } else {
        // + 1 to convert out of 0-indexing
        sessionCount = firstSend + 1
        isSent = true
        sentDate = sessions[firstSend].value.endTime || sessions[firstSend].value.startTime
      }

      return { uid, sessionCount, isSent, sentDate }
    })
}

const MAX_BLURBS = 2
const buildCardDescription = (route: RouteWithStats, props: RoutesFilterProps): string => {
  // Prefer displaying the description related to a sort key first, then by the rest of the sort options in order (as defined by SORT_FIELDS)
  const preferredOptions = [...new Set([...props.sortBy.map(s => s.key), ...SORT_FIELDS])].map(
    key => sortOptions[key]
  )
  const blurbs: string[] = []
  for (const opt of preferredOptions) {
    // Contribute description from this sort option if it is non-null
    const blurb = opt.display(route, props, blurbs.length === 0)
    if (blurb != null) {
      blurbs.push(blurb)
    }
    // Limit description length
    if (blurbs.length >= MAX_BLURBS) {
      break
    }
  }
  return blurbs.join(', ')
}

export default RoutesIndex
