import React from 'react'
import {OrderedList} from "../../types/Firebase";
import {User} from "../../types/User";
import {findUser} from "../../helpers/filterUtils";
import {Card} from 'react-bootstrap';
import {timeFromNow} from "../../helpers/dateUtils";
import {AggregateSessionMilestone} from "../../containers/ActivityFeed";
import {pluralize} from "../../helpers/mathUtils";

interface Props {
    users: OrderedList<User>
    milestone: AggregateSessionMilestone
}

const SessionDurationCard = ({users, milestone}: Props) => {
    const sessionUser = findUser(users, milestone.uid)

    return (
        <Card>
            <Card.Body>
                <Card.Title>{sessionUser.name} reached a total of {milestone.count} {pluralize('hour', milestone.count)} climbed!</Card.Title>
                <Card.Subtitle>{timeFromNow(milestone.date)}</Card.Subtitle>
            </Card.Body>
        </Card>
    )
}

export default SessionDurationCard