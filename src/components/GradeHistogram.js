import React, { useEffect, useState } from 'react'
import { BOULDER, compareGrades, gradeEquals, prettyPrint, TOP_ROPE } from '../helpers/gradeUtils'
import ReactiveBarGraph from './ReactiveBarGraph';
import moment from 'moment';
import { Button, Col, Container, Row } from 'react-bootstrap';

const addCount = (arr, key, count, allowSuffixes) => {
    const entry = arr.find(val => gradeEquals(val.key, key, allowSuffixes));
    if (entry) {
        entry.count += count;
    } else {
        arr.push({key, count});
    }
};

const ANIMATION_INTERVAL = 1000;

function getGraphData(users, allowedSessions, routes, allowedTypes, allowSuffixes) {
    // Maintain list of all grades for the x axis labels
    const allGrades = [];

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
                        addCount(acc, grade, customRoute.count, allowSuffixes);
                    }
                });
            }

            // Add grade/count for standard routes
            if (session.standardRoutes) {
                session.standardRoutes.forEach(standardRoute => {
                    if (allowedTypes.includes(standardRoute.key.style)) {
                        addCount(acc, standardRoute.key, standardRoute.count, allowSuffixes);
                    }
                });
            }

            return acc;
        }, []);

        // Add to list of all grades
        countByGrade.forEach(({key}) => {
            if (!allGrades.find(val => gradeEquals(val, key, allowSuffixes))) {
                allGrades.push(key);
            }
        });

        return {uid, name, countByGrade};
    }, {});

    const sortedGrades = [...allGrades].sort(compareGrades).reverse();

    const categories = sortedGrades.map(grade => prettyPrint(grade, allowSuffixes));

    const graphData = data.map(({name, countByGrade}) => {

        const barData = sortedGrades.map(grade => {
            const entry = countByGrade.find(val => gradeEquals(val.key, grade, allowSuffixes));
            return {x: prettyPrint(grade, allowSuffixes), y: entry && entry.count || 0};
        });

        return {name, barData};
    });
    return {categories, graphData};
}

const GradeHistogram = ({users, routes, sessions, allowSuffixes = false, allowedTypes = [BOULDER, TOP_ROPE]}) => {
    // Get session dates for animating
    const validUids = Object.keys(users);
    const sessionDates = Object.values(sessions).filter(session => validUids.includes(session.uid)).map(session => session.startTime).sort();
    const firstDate = moment(sessionDates[0]).subtract(1, 'month').endOf('month');
    const lastDate = moment(sessionDates[sessionDates - 1]).endOf('month');

    // While animating, track current max date
    const [maxDate, setMaxDate] = useState(undefined);

    useEffect(
        () => {
            let interval;
            if (maxDate) {
                // At each interval tick, set max date range to the next month
                interval = setInterval(
                    () => {
                        // Once all sessions are included, cancel animation
                        if (maxDate.isAfter(moment(sessionDates[sessionDates.length - 1]))) {
                            setMaxDate(undefined);
                        } else {
                            // Bump to end of next month
                            setMaxDate(maxDate.clone().add(1, 'day').endOf('month'));
                        }
                    },
                    ANIMATION_INTERVAL
                );
            }
            // In case component is unmounted, clear the interval
            return () => clearInterval(interval);
        },
        [maxDate]
    );

    // Use full graph data to get domain/range
    const {categories: allCategories, graphData: fullGraphData} = getGraphData(Object.values(users), Object.values(sessions), routes, allowedTypes, allowSuffixes);
    const maxValue = Math.max(...fullGraphData.flatMap(({barData}) => barData).map(({y}) => y));

    const allowedSessions = maxDate ? Object.values(sessions).filter(session => moment(session.startTime).isBefore(maxDate)) : Object.values(sessions);

    // Calculate totals for each user
    const {graphData} = getGraphData(Object.values(users), allowedSessions, routes, allowedTypes, allowSuffixes);

    return (
        <Container>
            <Row>
                <Col xs={12}>
                    <ReactiveBarGraph data={graphData} categories={allCategories} maxDomain={{y: maxValue}}
                                      animate={{duration: ANIMATION_INTERVAL / 4, onLoad: {duration: 0}}} />
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <p style={{textAlign: 'center'}}>{firstDate.format('MMMM YYYY')} to {(maxDate || lastDate).format('MMMM YYYY')}</p>
                </Col>
            </Row>
            <Row>
                <Col sm={{span: 6, offset: 3}}>
                    {maxDate ?
                        <Button block onClick={() => setMaxDate(undefined)}>Stop</Button> :
                        <Button block onClick={() => setMaxDate(firstDate)}>Play</Button>
                    }
                </Col>
            </Row>
        </Container>
    );
};

export default GradeHistogram;