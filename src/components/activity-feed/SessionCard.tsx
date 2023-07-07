import React from 'react'
import {Data, OrderedList, Persisted} from "../../types/Firebase";
import {User} from "../../types/User";
import {Session} from "../../types/Session";
import {Gym} from "../../types/Gym";
import {findUser} from "../../helpers/filterUtils";
import {Card} from 'react-bootstrap';
import {timeFromNow} from "../../helpers/dateUtils";

interface Props {
    uid: string
    users: OrderedList<User>
    session: Persisted<Session>
    gyms: Data<Gym>
}

const SessionCard = ({uid, users, session, gyms}: Props) => {
    const sessionUser = findUser(users, session.value.uid)
    const gymName = gyms[session.value.gymId]?.name || 'Unknown gym'

    const isOngoing = session.value.endTime === undefined

    let title;
    if (uid === session.value.uid) {
        if (isOngoing) {
            title = `You are climbing at ${gymName}`
        } else {
            title = `You climbed at ${gymName}`
        }
    } else {
        if (isOngoing) {
            title = `${sessionUser.name} is climbing at ${gymName}`
        } else {
            title = `${sessionUser.name} climbed at ${gymName}`
        }
    }


    return (
        <Card>
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Subtitle>{timeFromNow(session.value.startTime)}</Card.Subtitle>
                <Card.Link href={`/sessions/${session.key}`}>View Session</Card.Link>
            </Card.Body>
        </Card>
    )
}

export default SessionCard