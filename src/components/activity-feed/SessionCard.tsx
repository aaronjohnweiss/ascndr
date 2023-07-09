import React from 'react'
import {Data, Persisted} from "../../types/Firebase";
import {Session} from "../../types/Session";
import {Gym} from "../../types/Gym";
import {Card, Col, Container, Row} from 'react-bootstrap';
import {Route} from "../../types/Route";
import {FaPersonFalling} from 'react-icons/fa6'
import {IconContext} from "react-icons";
import {sessionDuration} from "../../helpers/durationUtils";
import {highestGradeForSession} from "../GradeHistory";
import {ALL_STYLES, prettyPrint} from "../../helpers/gradeUtils";
import {heightForSession} from "../StatsIndex";
import {defaultIconContext, iconColors} from "./iconStyle";

interface Props {
    session: Persisted<Session>
    gyms: Data<Gym>
    routes: Data<Route>
}

export const SessionCardBody = ({session, gyms, routes}: Props) => {
    const gym = gyms[session.value.gymId];
    const gymName = gym?.name || 'Unknown gym'
    const gymLocation = gym && gym.location

    const maxGrades = ALL_STYLES.map(style => highestGradeForSession(session.value, routes, style))
        .map(grade => grade.maxFullGrade)
        .filter(grade => grade != null)
        .map(grade => prettyPrint(grade))
        .join(' / ')

    const distanceClimbed = gym !== undefined ? heightForSession(session.value, routes, gym, [...ALL_STYLES], true) : 'Unknown'

    return (
        <div className='session-card'>
            <Container>
                <Row>
                    <Col xs={12}>Climbing session at <b>{gymName}</b>{gymLocation && ` in ${gymLocation}`}</Col>
                </Row>
                <Row className='session-summary-row'>
                    <Col xs={4}>
                        <Card>
                            <Card.Body>
                                <Card.Title>{session.value.endTime ? sessionDuration(session.value) : 'Ongoing'}</Card.Title>
                                {session.value.endTime && <Card.Subtitle>Duration</Card.Subtitle>}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={4}>
                        <Card>
                            <Card.Body>
                                {maxGrades ?
                                    <>
                                        <Card.Title>{maxGrades}</Card.Title>
                                        <Card.Subtitle>Max Grade</Card.Subtitle>
                                    </>
                                    : <Card.Title>No routes</Card.Title>}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={4}>
                        <Card>
                            <Card.Body>
                                <Card.Title>{distanceClimbed}ft</Card.Title>
                                <Card.Subtitle>Distance</Card.Subtitle>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}


export const SessionIcon =
    ({session}: Pick<Props, 'session'>) => session.value.endTime === undefined ?
        <IconContext.Provider value={{...defaultIconContext, color: iconColors.active}}>
            <FaPersonFalling/>
        </IconContext.Provider> : <></>