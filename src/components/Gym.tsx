import React from 'react'
import {Card} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {timeFromNow} from '../helpers/dateUtils';
import {getLatestSession} from '../helpers/filterUtils';

const Gym = ({gym, sessions}) => {
    const latestSession = getLatestSession(sessions);
    return (
        <Card>
            <Card.Body>
                <Card.Title>
                    <Link key={gym.key} to={`/gyms/${gym.key}`}>
                        {gym.value.name}
                    </Link>
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    {gym.value.location}
                </Card.Subtitle>
                <Card.Text>
                    {sessions.length} session{sessions.length === 1 ? '' : 's'}
                </Card.Text>
            </Card.Body>
            <Card.Footer>
                <small className='text-muted'> Last session: {latestSession ? latestSession.value.endTime ? timeFromNow(latestSession.value.startTime) : 'ongoing' : 'never'}</small>
            </Card.Footer>
        </Card>
    )
}

export default Gym