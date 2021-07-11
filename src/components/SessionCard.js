import React from 'react'
import GradeHistogram from './GradeHistogram';
import { ALL_STYLES } from '../helpers/gradeUtils';
import moment from 'moment';
import { Link } from 'react-router-dom';

const SessionCard = ({session, gym, user, routes}) => {
    return (
        <>
            <h4><Link to={`/gyms/${gym.key}`}>{gym.value.name}</Link>, {moment(session.value.endTime).fromNow()}</h4>
            <GradeHistogram users={{[user.uid]: user}} sessions={{[session.key]: session.value}} routes={routes}
                            allowedTypes={ALL_STYLES} allowSuffixes={true} canAnimate={false} />
        </>
    )
}

export default SessionCard