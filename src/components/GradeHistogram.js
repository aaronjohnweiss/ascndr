import React, { useEffect, useState } from 'react'
import { compareGrades, gradeEquals, prettyPrint } from '../helpers/gradeUtils'
import ReactiveBarGraph from './ReactiveBarGraph';
import moment from 'moment';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { partialRouteCount, routeCount } from './StatsIndex';

const addCount = (arr, key, count, partialCount, allowSuffixes) => {
    const entry = arr.find(val => gradeEquals(val.key, key, allowSuffixes));
    if (entry) {
        entry.count += count;
        entry.partialCount += partialCount;
    } else {
        arr.push({key, count, partialCount});
    }
};

const ANIMATION_INTERVAL = 1000;
const MAX_ANIMATION_DURATION = 10000;

function getGraphData(users, allowedSessions, routes, allowedTypes, allowSuffixes, allowPartials) {
    // Maintain list of all grades for the x axis labels
    const allGrades = [];
    let maxValue = 0;

    // Aggregate session data for each user
    const data = users.map(({uid, name}) => {
        const sessionsForUser = allowedSessions.filter(session => session.uid === uid);

        // Go through all sessions, aggregating routes by grade
        const countByGrade = sessionsForUser.reduce((acc, session) => {
            // Look up grade for any custom routes
            if (session.customRoutes) {
                session.customRoutes.forEach(customRoute => {
                    const grade = routes[customRoute.key].grade;

                    if (allowedTypes.includes(grade.style)) {
                        addCount(acc, grade, routeCount(customRoute), allowPartials && partialRouteCount(customRoute), allowSuffixes);
                    }
                });
            }

            // Add grade/count for standard routes
            if (session.standardRoutes) {
                session.standardRoutes.forEach(standardRoute => {
                    if (allowedTypes.includes(standardRoute.key.style)) {
                        addCount(acc, standardRoute.key, routeCount(standardRoute), allowPartials && partialRouteCount(standardRoute), allowSuffixes);
                    }
                });
            }

            return acc;
        }, []);

        // Add to list of all grades
        countByGrade.forEach(({key, count, partialCount}) => {
            if (!allGrades.find(val => gradeEquals(val, key, allowSuffixes))) {
                allGrades.push(key);
            }
            maxValue = Math.max(maxValue, count + partialCount);
        });

        return {uid, name, countByGrade};
    }, {});

    const sortedGrades = [...allGrades].sort(compareGrades).reverse();

    const categories = sortedGrades.map(grade => prettyPrint(grade, allowSuffixes));

    const graphData = data.map(({name, countByGrade}) => {

        const fullCompletions = [];
        const partialCompletions = [];
        const totalCompletions = {};

        sortedGrades.forEach(grade => {
            const entry = countByGrade.find(val => gradeEquals(val.key, grade, allowSuffixes));
            const x = prettyPrint(grade, allowSuffixes);
            const fullCount = entry && entry.count || 0;
            const partialCount = entry && entry.partialCount || 0;
            const fullAndPartialCount = fullCount + partialCount;
            fullCompletions.push({x, y: fullCount});
            partialCompletions.push({x, y: partialCount});
            totalCompletions[x] = fullAndPartialCount;
        });

        return {name, barData: [fullCompletions, partialCompletions], barTotals: totalCompletions};
    });
    return {categories, graphData, maxValue};
}

const GradeHistogram = ({users, routes, sessions, allowSuffixes, allowedTypes, allowPartials, canAnimate = true}) => {
    // Get session dates for animating
    const validUids = Object.keys(users);
    const sessionDates = Object.values(sessions).filter(session => validUids.includes(session.uid)).map(session => session.startTime).sort();
    const firstDate = moment(sessionDates[0]).subtract(1, 'month').endOf('month');
    const lastDate = moment(sessionDates[sessionDates.length - 1]).endOf('month');

    // While animating, track current max date
    const [maxDate, setMaxDate] = useState(undefined);

    useEffect(
        () => {
            let interval;
            const numMonths = Math.max(lastDate.diff(firstDate, 'months', false), 1);
            const animationInterval = Math.min(ANIMATION_INTERVAL, MAX_ANIMATION_DURATION / numMonths);
            if (maxDate) {
                // At each interval tick, set max date range to the next month
                interval = setInterval(
                    () => {
                        // Once all sessions are included, cancel animation
                        if (maxDate.isAfter(lastDate)) {
                            setMaxDate(undefined);
                        } else {
                            // Bump to end of next month
                            setMaxDate(maxDate.clone().add(1, 'day').endOf('month'));
                        }
                    },
                    animationInterval
                );
            }
            // In case component is unmounted, clear the interval
            return () => clearInterval(interval);
        },
        [maxDate]
    );

    // Use full graph data to get domain/range
    const {
        categories: allCategories,
        maxValue
    } = getGraphData(Object.values(users), Object.values(sessions), routes, allowedTypes, allowSuffixes, allowPartials);

    const allowedSessions = maxDate ? Object.values(sessions).filter(session => moment(session.startTime).isBefore(maxDate)) : Object.values(sessions);

    // Calculate totals for each user
    const {graphData} = getGraphData(Object.values(users), allowedSessions, routes, allowedTypes, allowSuffixes, allowPartials);

    return (
        <Container>
            <Row>
                <Col xs={12}>
                    <ReactiveBarGraph data={graphData} categories={allCategories} maxDomain={{y: maxValue}}
                                      animate={{duration: ANIMATION_INTERVAL / 4, onLoad: {duration: 0}}} showLegend={validUids.length > 1} isStacked={allowPartials}/>
                </Col>
            </Row>
            {canAnimate &&
            <>
                <Row>
                    <Col xs={12}>
                        <p style={{textAlign: 'center'}}>{firstDate.format('MMMM YYYY')} to {(maxDate || lastDate).format('MMMM YYYY')}</p>
                    </Col>
                </Row>
                <Row>
                    <Col sm={{span: 6, offset: 3}} className="d-grid d-block">
                        {maxDate ?
                            <Button onClick={() => setMaxDate(undefined)}>Stop</Button> :
                            <Button onClick={() => setMaxDate(firstDate)}>Play</Button>
                        }
                    </Col>
                </Row>
            </>
            }
        </Container>
    );
};

export default GradeHistogram;