import React from 'react'
import {getUser, useDatabase} from "../redux/selectors/selectors";
import {isLoaded} from 'react-redux-firebase'
import {OrderedList, Persisted} from "../types/Firebase";
import {Gym} from "../types/Gym";
import {Session} from "../types/Session";
import {User} from "../types/User";
import {Route} from "../types/Route";
import {Workout} from "../types/Workout";
import {sortBy} from "../helpers/sortUtils";
import SessionCard from "../components/activity-feed/SessionCard";
import {toObj} from "../helpers/objectConverters";
import {groupBy} from "../helpers/filterUtils";
import {entries} from "../helpers/recordUtils";
import SessionCountCard from "../components/activity-feed/SessionCountCard";
import SessionDurationCard from "../components/activity-feed/SessionDurationCard";
import moment from "moment";


export interface AggregateSessionMilestone {
    uid: string,
    count: number,
    date: number,
}

type FeedItem = {
    date: number,
    data: {
        _type: 'session',
        value: Persisted<Session>
    } | { _type: 'sessionCount', value: AggregateSessionMilestone } | { _type: 'totalDuration', value: AggregateSessionMilestone }
}
const buildFeedData = (uid: string, gyms: OrderedList<Gym>, sessions: OrderedList<Session>, users: OrderedList<User>, routes: OrderedList<Route>, workouts: OrderedList<Workout>): FeedItem[] => {
    const feedData = [
        ...getSessionFeedItems(sessions),
        ...getSessionCountFeedItems(sessions),
        ...getSessionDurationFeedItems(sessions),
    ]

    return feedData.sort(sortBy<FeedItem>()('date').descending)
}

const getSessionFeedItems = (sessions: OrderedList<Session>): FeedItem[] =>
    sessions.map(session => ({
        date: session.value.startTime,
        data: {
            _type: 'session',
            value: session
        }
    }))

const getSessionCountFeedItems = (sessions: OrderedList<Session>): FeedItem[] => {
    const sessionsByUser = groupBy(sessions, 'uid')
    return entries(sessionsByUser).flatMap(([uid, userSessions]) => {
        const milestones = getSessionCountMilestones(userSessions, uid)
        return milestones.map((milestone) => ({
            date: milestone.date,
            data: {
                _type: 'sessionCount',
                value: milestone
            }
        }))
    })
}
const getSessionDurationFeedItems = (sessions: OrderedList<Session>): FeedItem[] => {
    const sessionsByUser = groupBy(sessions, 'uid')
    return entries(sessionsByUser).flatMap(([uid, userSessions]) => {
        const milestones = getSessionDurationMilestones(userSessions, uid)
        return milestones.map((milestone) => ({
            date: milestone.date,
            data: {
                _type: 'totalDuration',
                value: milestone
            }
        }))
    })
}


const lowMilestones = [1, 5, 10, 25, 50, 75]

const isMilestoneCount = (n: number) => lowMilestones.some(milestone => n === milestone) || n % 100 === 0

const getMilestoneDuration = (before: number, after: number): number | undefined => {
    const lowMilestone = lowMilestones.find(milestone => before < milestone && milestone <= after);
    if (lowMilestone !== undefined) return lowMilestone

    if (after < 100) return undefined

    const beforeHundred = Math.floor(before / 100)
    const afterHundred = Math.floor(after / 100)

    if (beforeHundred === afterHundred) return undefined

    return afterHundred * 100
}
const getSessionCountMilestones = (sessions: OrderedList<Session>, uid: string): AggregateSessionMilestone[] => {

    const sortedSessions = sessions.map(session => session.value)
        .filter(session => session.endTime !== undefined)
        .sort(sortBy<Session>()('endTime').ascending)

    const milestones: AggregateSessionMilestone[] = []
    for (let i = 0; i < sortedSessions.length; i++) {
        if (isMilestoneCount(i + 1)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            milestones.push({count: i + 1, date: sortedSessions[i].endTime!, uid})
        }
    }
    return milestones
}

const getSessionDurationMilestones = (sessions: OrderedList<Session>, uid: string): AggregateSessionMilestone[] => {

    const sortedSessions = sessions.map(session => session.value)
        .filter(session => session.endTime !== undefined)
        .sort(sortBy<Session>()('endTime').ascending)

    const milestones: AggregateSessionMilestone[] = []
    let duration = 0
    for (const sortedSession of sortedSessions) {
        const sessionDuration = moment(sortedSession.endTime!).diff(moment(sortedSession.startTime), 'h', true)
        const milestoneDuration = getMilestoneDuration(duration, duration + sessionDuration)
        if (milestoneDuration !== undefined) {
            milestones.push({
                count: milestoneDuration,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                date: sortedSession.endTime!,
                uid
            })
        }
        duration = duration + sessionDuration
    }

    return milestones
}

const ActivityFeed = () => {
    const {uid} = getUser()
    const firebaseState = useDatabase()
    const gyms = firebaseState.gyms.getOrdered(['viewer', uid])
    const sessions = firebaseState.sessions.getOrdered(['viewer', uid])
    const users = firebaseState.users.getOrdered(['friendOf', uid])
    const routes = firebaseState.routes.getOrdered(['viewer', uid])
    const workouts = firebaseState.workouts.getOrdered(['viewer', uid])

    if (!isLoaded(gyms) || !isLoaded(sessions) || !isLoaded(users) || !isLoaded(routes) || !isLoaded(workouts)) return <></>

    const feedData = buildFeedData(uid, gyms, sessions, users, routes, workouts)

    return (
        <>
            {feedData.map((feedItem, idx) => {
                switch (feedItem.data._type) {
                    case "session":
                        return <SessionCard key={idx} session={feedItem.data.value} gyms={toObj(gyms)} users={users} uid={uid}/>
                    case "sessionCount":
                        return <SessionCountCard key={idx} milestone={feedItem.data.value} users={users} />
                    case 'totalDuration':
                        return <SessionDurationCard users={users} milestone={feedItem.data.value} key={idx} />
                }
            })}
        </>
    )

}

export default ActivityFeed

// Sessions
// Time milestones
// Session count milestones
// Grade milestones
// Projects
// Videos