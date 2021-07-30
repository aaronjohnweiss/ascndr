import React from 'react';
import { compareGrades, prettyPrint } from '../helpers/gradeUtils';
import { Button, Col, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { FaChevronRight } from 'react-icons/fa'
import { useLocation } from 'react-router-dom';
import { durationString } from '../helpers/durationUtils';
import { filtersLink } from '../containers/StatFilters';
import { sum } from '../helpers/sum';
import { PARTIAL_MAX } from './GradeModal';

export const StatItem = ({label, value, link}) => {
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

export const partialRouteCount = route => route.partials && Object.entries(route.partials).map(([key, val]) => key * val / PARTIAL_MAX).reduce(sum, 0) || 0;

export const routeCount = (route, allowPartials = false) => (route.count || 0) + + (allowPartials && partialRouteCount(route));

const routeCountForSession = ({customRoutes = [], standardRoutes = []}, routes, allowedTypes, allowPartials = false) => [
    ...customRoutes.filter(customRoute => allowedTypes.includes(routes[customRoute.key].grade.style)),
    ...standardRoutes.filter(standardRoute => allowedTypes.includes(standardRoute.key.style))
].map(route => routeCount(route, allowPartials)).reduce(sum, 0);

const heightForSession = (session, routes, gym = {}, allowedTypes = [], allowPartials = false) =>
    allowedTypes.map(type => {
        const count = routeCountForSession(session, routes, [type], allowPartials);
        const height = gym[`${type}_HEIGHT`] || 0;
        return count * height;
    }).reduce(sum, 0);

const StatsIndex = ({gyms, users, routes, sessions, allowSuffixes, allowedTypes, allowPartials}) => {
    const location = useLocation();
    const filterParams = location.search;

    const sessionValues = Object.values(sessions);
    // TODO filter to only sessions with <allowedTypes> routes logged?
    const numSessions = sessionValues.length;
    // Figure out total time; for each session do (end - start) but if end doesn't exist (ongoing session) do (now - start)
    const totalTime = numSessions && sessionValues.map(({startTime, endTime = new Date().getTime()}) => endTime - startTime).reduce(sum);
    const totalRoutes = numSessions && sessionValues.map(session => routeCountForSession(session, routes, allowedTypes, allowPartials)).reduce(sum);
    const totalDistance = numSessions && sessionValues.map(session => heightForSession(session, routes, gyms[session.gymId], allowedTypes, allowPartials)).reduce(sum);
    // Figure out max grades by type
    const maxGrades = sessionValues.flatMap(({customRoutes = [], standardRoutes = []}) => {
        // Get all grades climbed within the session (for the summary view, only do full completions)
        return [...customRoutes.filter(route => routeCount(route, false) > 0).map(customRoute => routes[customRoute.key].grade), ...standardRoutes.filter(route => routeCount(route, false) > 0).map(standardRoute => standardRoute.key)]
    }).reduce((obj, grade) => {
        if (allowedTypes.includes(grade.style)) {
            // Keep running max for each style
            if (compareGrades(obj[grade.style], grade) < 0) {
                obj[grade.style] = grade;
            }
        }
        return obj;
    }, {});

    return (
        <>
            <Row noGutters>
                <Col xs={6}><h2>Stats</h2></Col>
                <Col><Button href={filtersLink(location)} style={{float: 'right'}}>Filters</Button></Col>
            </Row>
            <Row>
                <Col><h4>Totals</h4></Col>
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
                <Col><h4>Averages</h4></Col>
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