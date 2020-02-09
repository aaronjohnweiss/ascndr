import React from 'react';
import { BOULDER, TOP_ROPE } from '../helpers/gradeUtils';
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
                <Col xs={4}>
                    {value}
                </Col>
                {link && <Col xs={2}><FaChevronRight /></Col>}
            </Row>
        </ListGroupItem>
    )
};

const sum = (a, b) => a + b;

const routeCountForSession = ({customRoutes, standardRoutes}) => [...(customRoutes || []), ...(standardRoutes || [])].map(route => route.count).reduce(sum, 0);

const StatsIndex = ({gyms, users, routes, sessions, allowSuffixes = false, allowedTypes = [BOULDER, TOP_ROPE]}) => {
    const filterParams = useLocation().search;

    const sessionValues = Object.values(sessions);
    const totalTime = sessionValues.map(({startTime, endTime}) => endTime - startTime).reduce(sum, 0);
    const totalRoutes = sessionValues.map(routeCountForSession).reduce(sum, 0);
    const totalDistance = sessionValues.map(session => {
        const {height = 0} = gyms[session.gymId] || {};
        return routeCountForSession(session) * height;
    }).reduce(sum, 0);

    return (
        <>
            <Row>
                <h2>Stats</h2>
            </Row>
            <Row>
                <h3>Totals</h3>
            </Row>
            <ListGroup>
                <StatItem label={'Time spent'} value={durationString(totalTime, false)} />
                <StatItem label={'Total routes'} value={totalRoutes} link={`/stats/gradeHistogram${filterParams}`} />
                <StatItem label={'Total distance'} value={`${totalDistance} ft`} />
            </ListGroup>
        </>
    )
};

export default StatsIndex;