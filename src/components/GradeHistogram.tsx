import React, { useEffect, useState } from 'react'
import { compareGrades, gradeEquals, prettyPrint } from '../helpers/gradeUtils'
import ReactiveBarGraph from './ReactiveBarGraph'
import moment from 'moment'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { partialRouteCount, routeCount } from './StatsIndex'
import { getUserName } from '../helpers/filterUtils'
import { Data } from '../types/Firebase'
import { Route } from '../types/Route'
import { Session } from '../types/Session'
import { Grade, RouteStyle } from '../types/Grade'
import { User } from '../types/User'
import MultiRangeSlider, { ChangeResult } from 'multi-range-slider-react'

interface CountForGrade<T> {
  key: T
  count: number
  partialCount: number
}

const addCount = <T,>(
  arr: CountForGrade<T>[],
  key: T,
  count: number,
  partialCount: number | false,
  allowSuffixes: boolean
) => {
  const entry = arr.find(val => gradeEquals(val.key, key, allowSuffixes))
  if (entry) {
    entry.count += count
    entry.partialCount += partialCount || 0
  } else {
    arr.push({ key, count, partialCount: partialCount || 0 })
  }
}

const ANIMATION_INTERVAL = 1000
const MAX_ANIMATION_DURATION = 10000

type BarDatum = { x: string; y: number }

function getGraphData(
  users: User[],
  allowedSessions: Session[],
  routes: Data<Route>,
  allowedTypes: RouteStyle[],
  allowSuffixes: boolean,
  allowPartials: boolean
) {
  // Maintain list of all grades for the x axis labels
  const allGrades: Grade[] = []
  let maxValue = 0

  // Aggregate session data for each user
  const data = users.map(user => {
    const sessionsForUser = allowedSessions.filter(session => session.uid === user.uid)

    // Go through all sessions, aggregating routes by grade
    const countByGrade = sessionsForUser.reduce((acc, session) => {
      // Look up grade for any custom routes
      if (session.customRoutes) {
        session.customRoutes.forEach(customRoute => {
          const grade = routes[customRoute.key].grade

          if (allowedTypes.includes(grade.style)) {
            addCount(
              acc,
              grade,
              routeCount(customRoute),
              allowPartials && partialRouteCount(customRoute),
              allowSuffixes
            )
          }
        })
      }

      // Add grade/count for standard routes
      if (session.standardRoutes) {
        session.standardRoutes.forEach(standardRoute => {
          if (allowedTypes.includes(standardRoute.key.style)) {
            addCount(
              acc,
              standardRoute.key,
              routeCount(standardRoute),
              allowPartials && partialRouteCount(standardRoute),
              allowSuffixes
            )
          }
        })
      }

      return acc
    }, [] as CountForGrade<Grade>[])

    // Add to list of all grades
    countByGrade.forEach(({ key, count, partialCount }) => {
      if (!allGrades.find(val => gradeEquals(val, key, allowSuffixes))) {
        allGrades.push(key)
      }
      maxValue = Math.max(maxValue, count + partialCount)
    })

    return { uid: user.uid, name: getUserName(user), countByGrade }
  }, {})

  const sortedGrades = [...allGrades].sort(compareGrades).reverse()

  const categories = sortedGrades.map(grade => prettyPrint(grade, allowSuffixes))

  const graphData = data.map(({ name, countByGrade }) => {
    const fullCompletions: BarDatum[] = []
    const partialCompletions: BarDatum[] = []
    const totalCompletions: Record<string, number> = {}

    sortedGrades.forEach(grade => {
      const entry = countByGrade.find(val => gradeEquals(val.key, grade, allowSuffixes))
      const x = prettyPrint(grade, allowSuffixes)
      const fullCount = (entry && entry.count) || 0
      const partialCount = (entry && entry.partialCount) || 0
      const fullAndPartialCount = fullCount + partialCount
      fullCompletions.push({ x, y: fullCount })
      partialCompletions.push({ x, y: partialCount })
      totalCompletions[x] = fullAndPartialCount
    })

    return { name, barData: [fullCompletions, partialCompletions], barTotals: totalCompletions }
  })
  return { categories, graphData, maxValue }
}

export interface GradeChartProps {
  users: Data<User>
  routes: Data<Route>
  sessions: Data<Session>
  allowSuffixes: boolean
  allowedTypes: RouteStyle[]
  allowPartials: boolean
  canAnimate?: boolean
}

const GradeHistogram = ({
  users,
  routes,
  sessions,
  allowSuffixes,
  allowedTypes,
  allowPartials,
  canAnimate = true,
}: GradeChartProps) => {
  // Get session dates for animating
  const validUids = Object.keys(users)
  const sessionDates = Object.values(sessions)
    .filter(session => validUids.includes(session.uid))
    .map(session => session.startTime)
    .sort()
  const firstDate = moment(sessionDates[0]).subtract(1, 'month').startOf('month')
  const lastDate = moment(sessionDates[sessionDates.length - 1]).endOf('month')
  const numMonths = Math.max(lastDate.diff(firstDate, 'months', false), 1)
  const [isAnimating, setIsAnimating] = useState(false)
  // Track date range
  const [minDateValue, setMinDateValue] = useState(0)
  const [maxDateValue, setMaxDateValue] = useState<number | undefined>(undefined)

  const minDate = firstDate.clone().add(minDateValue, 'months').startOf('month')
  const maxDate =
    maxDateValue === undefined
      ? undefined
      : firstDate.clone().add(maxDateValue, 'months').endOf('month')

  const onRangeSliderChange = ({ minValue, maxValue }: ChangeResult) => {
    setMinDateValue(minValue)
    setMaxDateValue(maxValue)
  }

  const startAnimation = () => {
    setMaxDateValue(minDateValue)
    setIsAnimating(true)
  }

  useEffect(() => {
    let interval
    const animationInterval = Math.min(ANIMATION_INTERVAL, MAX_ANIMATION_DURATION / numMonths)
    if (maxDateValue !== undefined && isAnimating) {
      // At each interval tick, set max date range to the next month
      interval = setInterval(() => {
        const newMaxDate = maxDateValue + 1
        // Once all sessions are included, cancel animation
        if (newMaxDate >= numMonths) {
          setMaxDateValue(undefined)
          setIsAnimating(false)
        } else {
          setMaxDateValue(newMaxDate)
        }
      }, animationInterval)
    }
    // In case component is unmounted, clear the interval
    return () => clearInterval(interval)
  }, [isAnimating, maxDateValue])

  // Use full graph data to get domain/range
  const { categories: allCategories, maxValue } = getGraphData(
    Object.values(users),
    Object.values(sessions),
    routes,
    allowedTypes,
    allowSuffixes,
    allowPartials
  )

  const allowedSessions = Object.values(sessions)
    .filter(session => !maxDate || moment(session.startTime).isBefore(maxDate))
    .filter(session => moment(session.startTime).isAfter(minDate))

  // Calculate totals for each user
  const { graphData } = getGraphData(
    Object.values(users),
    allowedSessions,
    routes,
    allowedTypes,
    allowSuffixes,
    allowPartials
  )

  return (
    <Container>
      <Row>
        <Col xs={12}>
          <ReactiveBarGraph
            data={graphData}
            categories={allCategories}
            maxDomain={{ y: maxValue }}
            animate={{ duration: ANIMATION_INTERVAL / 4, onLoad: { duration: 0 } }}
            showLegend={validUids.length > 1}
            isStacked={allowPartials}
          />
        </Col>
      </Row>
      {canAnimate && (
        <>
          <Row>
            <Col xs={12}>
              <p style={{ textAlign: 'center' }}>
                {minDate.format('MMMM YYYY')} to {(maxDate || lastDate).format('MMMM YYYY')}
              </p>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <MultiRangeSlider
                min={0}
                max={numMonths}
                minValue={minDateValue}
                maxValue={maxDateValue}
                step={1}
                ruler={false}
                label={false}
                onChange={onRangeSliderChange}
                onInput={onRangeSliderChange}
                style={{ border: 'none', boxShadow: 'none' }}
                barInnerColor={'blue'}
              />
            </Col>
          </Row>
          <Row>
            <Col sm={{ span: 6, offset: 3 }} className="d-grid d-block">
              {isAnimating ? (
                <Button onClick={() => setMaxDateValue(undefined)}>Stop</Button>
              ) : (
                <Button onClick={() => startAnimation()}>Play</Button>
              )}
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default GradeHistogram
