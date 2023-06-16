import React from 'react';
import {compareGrades, compareSplitCounts, prettyPrint} from '../helpers/gradeUtils';
import {Button, Card, Col, Row} from 'react-bootstrap';
import {useHistory, useLocation} from 'react-router-dom';
import {printSplitRouteCount, routeCount, splitRouteCount} from "./StatsIndex";
import {sumByKey} from "../helpers/mathUtils";
import {PARTIAL_MAX} from "./GradeModal";
import {FAILED_IMAGE, PENDING_IMAGE} from "../containers/RoutePage";
import {Data} from "../types/Firebase";
import {Route} from "../types/Route";
import {Session} from "../types/Session";
import {RouteStyle} from "../types/Grade";

export interface RoutesFilterProps {
    routes: Data<Route>
    sessions: Data<Session>
    allowedTypes: RouteStyle[]
    allowPartials: boolean
    sortBy: {
        key: string,
        desc: boolean
    }[]
}
const RoutesIndex = ({routes, sessions, allowedTypes, allowPartials, sortBy}: RoutesFilterProps) => {
    const location = useLocation();
    const history = useHistory();
    const filterParams = location.search;

    const stats = Object.entries(routes)
        .filter(([, route]) => route.grade && allowedTypes.includes(route.grade.style))
        .map(([key, route]) => [key, statsForRoute(key, route, sessions, allowPartials)] as const)
        .sort(([k1, r1], [k2, r2]) => {
        for (const {key, desc} of sortBy) {
            let compareResult = 0
            switch(key) {
                case 'created':
                    compareResult = k1.localeCompare(k2)
                    break
                case 'time':
                    if (!r1.time) compareResult = -1
                    else if (!r2.time) compareResult = 1
                    else compareResult = r1.time - r2.time
                    break
                case 'count':
                    compareResult = compareSplitCounts(r1.count, r2.count)
                    break
                case 'grade':
                    compareResult = compareGrades(r1.grade, r2.grade)
                    break
            }
            compareResult *= desc ? -1 : 1
            if (compareResult !== 0) return compareResult
        }
        return 0
    })

    console.log(stats)

    const cards = stats.map(([key,route], idx) => <Card key={idx}>
        <Card.Img variant='top' src={(route.picture && route.picture !== FAILED_IMAGE && route.picture !== PENDING_IMAGE) ? route.picture : '/ElCap-512.png'} onClick={() => history.push(`/routes/${key}`)} />
        <Card.Body>
            <Card.Title>{route.name || 'Unnamed'} {prettyPrint(route.grade)}</Card.Title>
            <Card.Text>
                Climbed {printSplitRouteCount(route.count, allowPartials)}{route.time && `, most recently on ${new Date(route.time).toDateString()}` || ''}
            </Card.Text>
        </Card.Body>
    </Card>)

    return (
        <>
            <Row>
                <Col xs={6}><h2>Routes</h2></Col>
                <Col><Button href={`/routeGallery/filters${filterParams}`} style={{float: 'right'}}>Filters</Button></Col>
            </Row>
            <Row>
                {cards.map((card, idx) => <Col key={idx} xs={6} sm={4} md={3} lg={2}>{card}</Col>)}
            </Row>

        </>
    )
};

const statsForRoute = (routeKey: string, route: Route, sessions: Data<Session>, allowPartials: boolean): Route & {count: Record<string, number>, time: number | null} => {
    const sessionStats = Object.values(sessions).flatMap(session => (session.customRoutes || []).map((rt) => [rt, session.startTime] as const))
        .filter(([customRoute]) => customRoute.key === routeKey)
        .map(([customRoute, time]) => [allowPartials ? splitRouteCount(customRoute) : ({[PARTIAL_MAX]: routeCount(customRoute, allowPartials)}), time] as const)
        .reduce((acc, [count, time]) => ({count: sumByKey(acc.count, count), times: [...acc.times, time]}), {
            count: {} as Record<string, number>,
            times: [] as number[]
        });

    return {
        ...route,
        count: sessionStats.count,
        time: sessionStats.times.length ? Math.max(...sessionStats.times) : null
    }
}


export default RoutesIndex;