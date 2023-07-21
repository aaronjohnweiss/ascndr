import React from 'react'
import GradeHistogram from './GradeHistogram'
import { ALL_STYLES } from '../helpers/gradeUtils'
import { Link } from 'react-router-dom'
import { hasRoutes } from '../helpers/filterUtils'
import { timeFromNow } from '../helpers/dateUtils'

const SessionCard = ({ session, gym, user, routes }) => {
  return (
    <>
      <h4>
        <Link to={`/gyms/${gym.key}`}>{gym.value.name}</Link>{' '}
        {session.value.endTime ? `, ${timeFromNow(session.value.startTime)}` : '(ongoing)'}
      </h4>
      {hasRoutes(session.value) ? (
        <GradeHistogram
          users={{ [user.uid]: user }}
          sessions={{ [session.key]: session.value }}
          routes={routes}
          allowedTypes={[...ALL_STYLES]}
          allowSuffixes={true}
          allowPartials={true}
          canAnimate={false}
        />
      ) : (
        <p>No routes in this session</p>
      )}
    </>
  )
}

export default SessionCard
