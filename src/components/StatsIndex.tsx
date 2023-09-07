import React from 'react'
import { compareGrades, prettyPrint, printPercentage } from '../helpers/gradeUtils'
import { Button, Col, ListGroup, ListGroupItem, Row } from 'react-bootstrap'
import { FaChevronRight } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { durationString } from '../helpers/durationUtils'
import { filtersLink } from '../containers/StatFilters'
import { max, pluralize, sum } from '../helpers/mathUtils'
import { PARTIAL_MAX } from './GradeModal'
import { Route } from '../types/Route'
import { RouteCount, Session } from '../types/Session'
import { Data } from '../types/Firebase'
import { Grade, RouteStyle } from '../types/Grade'
import { Gym } from '../types/Gym'
import { LinkContainer } from 'react-router-bootstrap'

export const StatItem = ({
  label,
  value,
  link,
}: {
  label: string
  value?: string | number
  link?: string
}) => {
  const paddingStyle = { paddingTop: '8px', paddingBottom: '8px' }
  // Some stat items are links - those will get the `action` prop
  // The outermost element should have the padding style applied - for links, that will be the LinkContainer, but for non-links, that will be the ListGroupItem
  const listItemProps = link ? { action: true } : { style: paddingStyle }
  const listItem = (
    <ListGroupItem {...listItemProps}>
      <Row style={{ marginBottom: '0' }}>
        <Col xs={7}>{label}</Col>
        <Col xs={link ? 3 : 4}>{value}</Col>
        {link && (
          <Col xs={2} className="d-flex align-items-center justify-content-end">
            <FaChevronRight />
          </Col>
        )}
      </Row>
    </ListGroupItem>
  )

  if (link) {
    return (
      <LinkContainer to={link} style={paddingStyle}>
        {listItem}
      </LinkContainer>
    )
  }
  return listItem
}

export const partialRouteCount = <T,>(route: RouteCount<T>): number =>
  (route.partials &&
    Object.entries(route.partials)
      .map(([key, val]) => (Number(key) * val) / PARTIAL_MAX)
      .reduce(sum, 0)) ||
  0

export const routeCount = <T,>(route: RouteCount<T>, allowPartials = false): number =>
  (route.count || 0) + (allowPartials ? partialRouteCount(route) : 0)

type SplitCount = Record<number, number>
export const splitRouteCount = <T,>(route: RouteCount<T>): SplitCount => {
  const percentageCounts = {
    [PARTIAL_MAX]: route.count || 0,
    ...(route.partials || {}),
  }
  return Object.fromEntries(Object.entries(percentageCounts).filter(([, count]) => count > 0))
}

export const printSplitRouteCount = (splitCount: SplitCount, maxOnly = false) => {
  const percentages = Object.entries(splitCount)
    .map(([pct, count]) => [Number(pct), count])
    .sort(([pctA], [pctB]) => pctB - pctA)
    .filter(([, count]) => count > 0)
    .filter(([pct]) => !maxOnly || pct == maxSplitPct(splitCount))
  if (percentages.length === 0) {
    return '0 times'
  }

  return percentages
    .map(([percentage, count]) =>
      percentage == PARTIAL_MAX
        ? `${count} ${pluralize('time', count)}`
        : `${count} x ${printPercentage(percentage)}`,
    )
    .join(', ')
}

export const maxSplitPct = (splitCount: SplitCount) =>
  Object.keys(splitCount)
    .map(pct => Number(pct))
    .reduce(max, 0)

export const routeCountForSession = (
  { customRoutes = [], standardRoutes = [] }: Session,
  routes: Data<Route>,
  allowedTypes: RouteStyle[],
  allowPartials = false,
) =>
  [
    ...customRoutes.filter(customRoute =>
      allowedTypes.includes(routes[customRoute.key].grade?.style),
    ),
    ...standardRoutes.filter(standardRoute => allowedTypes.includes(standardRoute.key.style)),
  ]
    .map(route => routeCount<string | Grade>(route, allowPartials))
    .reduce(sum, 0)

export const heightForSession = (
  session: Session,
  routes: Data<Route>,
  gym: Gym,
  allowedTypes: RouteStyle[] = [],
  allowPartials = false,
) =>
  allowedTypes
    .map(type => {
      const count = routeCountForSession(session, routes, [type], allowPartials)
      const height = Number(gym[`${type}_HEIGHT`]) || 0
      return count * height
    })
    .reduce(sum, 0)

export interface StatsFilterProps {
  gyms: Data<Gym>
  routes: Data<Route>
  sessions: Data<Session>
  allowSuffixes: boolean
  allowedTypes: RouteStyle[]
  allowPartials: boolean
}

const StatsIndex = ({
  gyms,
  routes,
  sessions,
  allowSuffixes,
  allowedTypes,
  allowPartials,
}: StatsFilterProps) => {
  const location = useLocation()
  const filterParams = location.search

  const sessionValues = Object.values(sessions)
  // TODO filter to only sessions with <allowedTypes> routes logged?
  const numSessions = sessionValues.length
  // Figure out total time; for each session do (end - start) but if end doesn't exist (ongoing session) do (now - start)
  const totalTime =
    numSessions &&
    sessionValues
      .filter(session => session.endTime !== undefined)
      .map(
        ({
          startTime,
          endTime,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        }) => endTime! - startTime,
      )
      .reduce(sum, 0)
  const totalRoutes =
    numSessions &&
    sessionValues
      .map(session => routeCountForSession(session, routes, allowedTypes, allowPartials))
      .reduce(sum, 0)
  const totalDistance =
    numSessions &&
    sessionValues
      .map(session =>
        heightForSession(session, routes, gyms[session.gymId], allowedTypes, allowPartials),
      )
      .reduce(sum, 0)
  // Figure out max grades by type
  const maxGrades = sessionValues
    .flatMap(({ customRoutes = [], standardRoutes = [] }) => {
      // Get all grades climbed within the session (for the summary view, only do full completions)
      return [
        ...customRoutes
          .filter(route => routeCount(route, false) > 0)
          .map(customRoute => routes[customRoute.key].grade),
        ...standardRoutes
          .filter(route => routeCount(route, false) > 0)
          .map(standardRoute => standardRoute.key),
      ]
    })
    .reduce(
      (obj, grade) => {
        if (grade?.style !== undefined && allowedTypes.includes(grade.style)) {
          // Keep running max for each style
          if (compareGrades(obj[grade.style], grade) < 0) {
            obj[grade.style] = grade
          }
        }
        return obj
      },
      {} as Record<RouteStyle, Grade>,
    )

  return (
    <>
      <Row>
        <Col xs={6}>
          <h2>Stats</h2>
        </Col>
        <Col>
          <LinkContainer to={filtersLink(location)} style={{ float: 'right' }}>
            <Button>Filters</Button>
          </LinkContainer>
        </Col>
      </Row>
      <Row>
        <Col>
          <h4>Totals</h4>
        </Col>
      </Row>
      <ListGroup>
        <StatItem label={'Time spent'} value={durationString(totalTime, false)} />
        <StatItem
          label={'Total routes'}
          value={totalRoutes}
          link={`/stats/gradeHistogram${filterParams}`}
        />
        <StatItem label={'Total distance'} value={`${totalDistance}ft`} />
        <StatItem
          label={`Hardest grade${allowedTypes.length > 1 ? 's' : ''}`}
          value={Object.values(maxGrades)
            .map(grade => prettyPrint(grade, allowSuffixes))
            .join(', ')}
          link={`/stats/gradeHistory${filterParams}`}
        />
      </ListGroup>
      <br />
      <Row>
        <Col>
          <h4>Averages</h4>
        </Col>
      </Row>
      <ListGroup>
        <StatItem label={'Time spent'} value={durationString(totalTime / numSessions)} />
        <StatItem label={'Routes climbed'} value={Math.round(totalRoutes / numSessions) || 0} />
        <StatItem
          label={'Distance climbed'}
          value={`${Math.round(totalDistance / numSessions) || 0}ft`}
        />
      </ListGroup>
    </>
  )
}

export default StatsIndex
