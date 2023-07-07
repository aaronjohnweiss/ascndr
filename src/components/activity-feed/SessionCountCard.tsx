import React from 'react'
import {OrderedList} from "../../types/Firebase";
import {User} from "../../types/User";
import {findUser} from "../../helpers/filterUtils";
import {Card} from 'react-bootstrap';
import {timeFromNow} from "../../helpers/dateUtils";
import {AggregateSessionMilestone} from "../../containers/ActivityFeed";

interface Props {
    users: OrderedList<User>
    milestone: AggregateSessionMilestone
}

const SessionCountCard = ({users, milestone}: Props) => {
    const sessionUser = findUser(users, milestone.uid)

    return (
        <Card>
            <Card.Body>
                <Card.Title>{milestone.count === 1 ? `${sessionUser.name} logged their first session!` : `${sessionUser.name} climbed ${milestone.count} sessions!`}</Card.Title>
                <Card.Subtitle>{timeFromNow(milestone.date)}</Card.Subtitle>
            </Card.Body>
        </Card>
    )
}

export default SessionCountCard