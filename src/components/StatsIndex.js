import React from 'react';
import { compareGrades, prettyPrint } from '../helpers/gradeUtils';
import { Col, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { FaChevronRight } from 'react-icons/fa'
import { useLocation } from 'react-router-dom';
import { durationString } from '../helpers/durationUtils';

const StatItem = ({label, value, link}) => {
    const itemProps = link ? {action: true, href: link} : {};

    return (
        <ListGroupItem {...itemProps} style={{paddingTop: '8px', paddingBottom: '8px'}}>
            <Row style={{marginBottom: '0'}}>
                <Col xs={6}>
                    {label}
                </Col>
                <Col>
                    {value}
                </Col>
                {link && <Col xs={2}><FaChevronRight /></Col>}
            </Row>
        </ListGroupItem>
    )
};

const sum = (a, b) => a + b;

const routeCountForSession = ({customRoutes = [], standardRoutes = []}) => [...customRoutes, ...standardRoutes].map(route => route.count).reduce(sum, 0);

const StatsIndex = ({gyms, users, routes, sessions, allowSuffixes, allowedTypes}) => {
    const filterParams = useLocation().search;

    const sessionValues = Object.values(sessions);
    const numSessions = sessionValues.length;
    // Figure out total time; for each session do (end - start) but if end doesn't exist (ongoing session) do (now - start)
    const totalTime = numSessions && sessionValues.map(({startTime, endTime = new Date().getTime()}) => endTime - startTime).reduce(sum);
    const totalRoutes = numSessions && sessionValues.map(routeCountForSession).reduce(sum);
    // Figure out max grades by type
    const maxGrades = sessionValues.flatMap(({customRoutes = [], standardRoutes = []}) => {
        // Get all grades climbed within the session
        return [...customRoutes.map(customRoute => routes[customRoute.key].grade), ...standardRoutes.map(standardRoute => standardRoute.key)]
    }).reduce((obj, grade) => {
        if (allowedTypes.includes(grade.style)) {
            // Keep running max for each style
            if (compareGrades(obj[grade.style], grade) < 0) {
                obj[grade.style] = grade;
            }
        }
        return obj;
    }, {});

    const totalDistance = sessionValues.map(session => {
        const {height = 0} = gyms[session.gymId] || {};
        // TODO include bouldering height
        return routeCountForSession(session) * height;
    }).reduce(sum, 0);

    return (
        <>
            <Row>
                <h2>Stats</h2>
            </Row>
            <Row>
                <h4>Totals</h4>
            </Row>
            <ListGroup>
                <StatItem label={'Time spent'} value={durationString(totalTime, false)} />
                <StatItem label={'Total routes'} value={totalRoutes} link={`/stats/gradeHistogram${filterParams}`} />
                <StatItem label={'Total distance'} value={`${totalDistance} ft`} />
                <StatItem label={`Hardest grade${allowedTypes.length > 1 ? 's' : ''}`}
                          value={Object.values(maxGrades).map(grade => prettyPrint(grade, allowSuffixes)).join(', ')}
                          link={`/stats/gradeHistory${filterParams}`} />
            </ListGroup>
            <br />
            <Row>
                <h4>Averages</h4>
            </Row>
            <ListGroup>
                <StatItem label={'Time spent'} value={durationString(totalTime / numSessions)} />
                <StatItem label={'Routes climbed'} value={Math.round(totalRoutes / numSessions)} />
                <StatItem label={'Distance climbed'} value={`${Math.round(totalDistance / numSessions)} ft`} />
            </ListGroup>
        </>
    )
};

export default StatsIndex;