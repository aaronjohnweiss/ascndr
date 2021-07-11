import React from 'react'
import GradeHistogram from './GradeHistogram';
import { ALL_STYLES } from '../helpers/gradeUtils';
import moment from 'moment';

const SessionCard = ({session, gym, user, routes}) => {
    return (
        <>
            <h4>{gym.name}, {moment(session.value.endTime).fromNow()}</h4>
            <GradeHistogram users={{[user.uid]: user}} sessions={{[session.key]: session.value}} routes={routes}
                            allowedTypes={ALL_STYLES} allowSuffixes={true} canAnimate={false} />
        </>
    )
}

export default SessionCard