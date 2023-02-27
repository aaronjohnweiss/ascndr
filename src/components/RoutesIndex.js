import React from 'react';
import {compareGrades, prettyPrint} from '../helpers/gradeUtils';
import {Button, Card, Col, Row} from 'react-bootstrap';
import {useHistory, useLocation} from 'react-router-dom';
import {routeCount} from "./StatsIndex";


const RoutesIndex = ({routes, sessions, allowedTypes, allowPartials, sortBy}) => {
    const location = useLocation();
    const history = useHistory();
    const filterParams = location.search;

    const stats = Object.entries(routes)
        .filter(([, route]) => route.grade && allowedTypes.includes(route.grade.style))
        .map(([key, route]) => [key, statsForRoute(key, route, sessions, allowPartials)])
        .sort(([k1, r1], [k2, r2]) => {
        for (let {key, desc} of sortBy) {
            let compareResult = 0
            switch(key) {
                case 'created':
                    compareResult = k1.localeCompare(k2)
                    break
                case 'time':
                    compareResult = r1.time - r2.time
                    break
                case 'count':
                    compareResult = r1.count - r2.count
                    break
                case 'grade':
                    compareResult = compareGrades(r1.grade, r2.grade)
                    break
            }
            compareResult *= (desc === true) ? -1 : 1
            if (compareResult !== 0) return compareResult
        }
        return 0
    })

    const cards = stats.map(([key,route], idx) => <Card key={idx}>
        <Card.Img variant='top' src={route.picture || '/ElCap-512.png'} onClick={() => history.push(`/routes/${key}`)} />
        <Card.Body>
            <Card.Title>{route.name || 'Unnamed'} {prettyPrint(route.grade)}</Card.Title>
            <Card.Text>
                Climbed {route.count} time{route.count !== 1 ? 's' : ''}{route.time && `, most recently on ${new Date(route.time).toDateString()}` || ''}
            </Card.Text>
        </Card.Body>
    </Card>)

    return (
        <>
            <Row noGutters>
                <Col xs={6}><h2>Routes</h2></Col>
                <Col><Button href={`/routeGallery/filters${filterParams}`} style={{float: 'right'}}>Filters</Button></Col>
            </Row>
            <Row>
                {cards.map((card, idx) => <Col key={idx} xs={6} sm={4} md={3} lg={2}>{card}</Col>)}
            </Row>

        </>
    )
};

const statsForRoute = (routeKey, route, sessions, allowPartials) => {
    const sessionStats = Object.values(sessions).flatMap(session => (session.customRoutes || []).map(rt => [rt, session.startTime]))
        .filter(([customRoute]) => customRoute.key === routeKey)
        .map(([customRoute, time]) => [routeCount(customRoute, allowPartials), time])
        .reduce((acc, [count, time]) => ({count: acc.count + count, times: [...acc.times, time]}), {
            count: 0,
            times: []
        });

    return {
        ...route,
        count: sessionStats.count,
        time: Math.max(sessionStats.times)
    }
}


export default RoutesIndex;