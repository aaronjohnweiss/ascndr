import {OrderedList, Persisted} from "../types/Firebase";
import {Route, RouteVideo} from "../types/Route";
import {FinishedSession, isFinished, Session} from "../types/Session";
import {groupBy} from "./filterUtils";
import {calculateProjectTimes, isSent, Project} from "../components/RoutesIndex";
import {buildSort, contramap, sortBy} from "./sortBuilder";
import moment from "moment";
import {Workout} from "../types/Workout";
import {entries} from "./recordUtils";
import {Gym} from "../types/Gym";
import {User} from "../types/User";
import {Grade} from "../types/Grade";
import {calculateProgression} from "../components/GradeHistory";
import {toObj} from "./objectConverters";
import {ALL_STYLES} from "./gradeUtils";

export type AggregateSessionMilestone = {
    count: number,
    unit: 'sessionCount' | 'duration'
} | {
    grade: Grade,
    unit: 'grade'
}
type FeedData = {
    _type: 'session',
    value: Persisted<Session>
} | {
    _type: 'milestone',
    value: AggregateSessionMilestone
} | {
    _type: 'workout',
    value: Persisted<Workout>
} | {
    _type: 'video',
    value: {
        routeKey: string,
        video: RouteVideo
    }
} | {
    _type: 'project',
    value: {
        routeKey: string,
        project: Project
    }
}
export type FeedItem = {
    date: number,
    uid: string,
    link?: string,
    data: FeedData
}
type FeedItemType = FeedData['_type']
// Sort order - earlier items in this list will be displayed before later items, in case the items' dates are the same
const FeedItemTypes: FeedItemType[] = [
    'project',
    'milestone',
    'video',
    'session',
    'workout',
]

/**
 * Build a sorted list of activity feed items based on the provided data
 */
export const buildFeedData = (uid: string, gyms: OrderedList<Gym>, sessions: OrderedList<Session>, users: OrderedList<User>, routes: OrderedList<Route>, workouts: OrderedList<Workout>): FeedItem[] => {
    const feedData = [
        ...getSessionFeedItems(sessions),
        ...getSessionMilestoneFeedItems(sessions),
        ...getGradeMilestoneFeedItems(sessions, routes),
        ...getWorkoutFeedItems(workouts),
        ...getVideoFeedItems(routes, users),
        ...getProjectFeedItems(routes, sessions),
    ]

    return feedData.sort(buildSort(
        sortBy<FeedItem>()('date').descending,
        // Break ties according to the order of FeedItemTypes: earlier types in the array should come first
        sortBy<FeedItem>()('data', contramap(data => FeedItemTypes.indexOf(data._type))).ascending
    ))
}

/**
 * Simple feed item for each session
 */
const getSessionFeedItems = (sessions: OrderedList<Session>): FeedItem[] =>
    sessions.map(session => ({
        date: session.value.startTime,
        uid: session.value.uid,
        link: `/sessions/${session.key}`,
        data: {
            _type: 'session',
            value: session
        }
    }))

/**
 * Simple feed item for each workout
 */
const getWorkoutFeedItems = (workouts: OrderedList<Workout>): FeedItem[] =>
    workouts.map(workout => ({
        date: workout.value.startTime,
        uid: workout.value.uid,
        data: {
            _type: 'workout',
            value: workout
        }
    }))

/**
 * Aggregated session milestones (total hours climbed, total sessions climbed) per user
 */
const getSessionMilestoneFeedItems = (sessions: OrderedList<Session>): FeedItem[] => {
    const sessionsByUser = groupBy(sessions, 'uid')
    return entries(sessionsByUser).flatMap(([uid, userSessions]) => {
        const milestones = getSessionCountMilestones(userSessions)
        return milestones.map((milestone) => ({
            date: milestone.date,
            uid,
            data: {
                _type: 'milestone',
                value: milestone
            }
        }))
    })
}

/**
 * New highest grades per user
 */
const getGradeMilestoneFeedItems = (sessions: OrderedList<Session>, routes: OrderedList<Route>): FeedItem[] => {
    const sessionsByUser = groupBy(sessions, 'uid')
    return entries(sessionsByUser).flatMap(([uid, userSessions]) => {
        // For each user, calculate their full progression history in all styles. This ignores hiatuses.
        const milestones = calculateProgression(userSessions, toObj(routes), true, [...ALL_STYLES], false)
        return milestones.flatMap(({firsts}) => firsts).map(milestone => ({
            date: milestone.date,
            uid,
            link: `/sessions/${milestone.key}`,
            data: {
                _type: 'milestone',
                value: {
                    unit: 'grade',
                    grade: milestone.grade
                }
            }
        }))
    })
}

/**
 * Video uploads
 */
const getVideoFeedItems = (routes: OrderedList<Route>, users: OrderedList<User>): FeedItem[] => {
    return routes.flatMap(({key, value}) => value.videos
        ?.filter(video => users.some(u => u.value.uid === video.uid))
        .map(video => ({
            date: video.date,
            uid: video.uid,
            data: {
                _type: 'video',
                value: {
                    routeKey: key,
                    video,
                }
            }
        })) || [])
}

/**
 * Minimum number of sessions for a project to show up in the feed
 */
const MIN_PROJECT_SESSIONS = 2
/**
 * Projects sent by each user (routes that took at least {@link MIN_PROJECT_SESSIONS} sessions to climb successfully)
 */
const getProjectFeedItems = (routes: OrderedList<Route>, sessions: OrderedList<Session>): FeedItem[] => {
    const sessionsByUser = groupBy(sessions, 'uid')

    return routes.flatMap(route => calculateProjectTimes(route.key, sessionsByUser)
        // Exclude in-progress projects
        .filter(isSent)
        // Exclude projects below session count threshold
        .filter(project => project.sessionCount >= MIN_PROJECT_SESSIONS)
        .map(project => ({
            date: project.sentDate,
            uid: project.uid,
            link: `/routes/${route.key}`,
            data: {
                _type: 'project',
                value: {
                    routeKey: route.key,
                    project
                }
            }
        })))
}

/**
 * Milestone counts for aggregated session info
 */
const lowMilestones = [1, 5, 10, 25, 50, 75]
/**
 * Determine if this is a milestone session count (any entry of {@link lowMilestones} or any multiple of 100)
 */
const isMilestoneCount = (n: number) => lowMilestones.some(milestone => n === milestone) || n % 100 === 0

/**
 * Return any milestone duration passed in this session (any session that brings the total above {@link lowMilestones} or any multiple of 100 hrs climbed)
 */
const getMilestoneDuration = (before: number, after: number): number | undefined => {
    const lowMilestone = lowMilestones.findLast(milestone => before < milestone && milestone <= after);
    if (lowMilestone !== undefined) return lowMilestone

    if (after < 100) return undefined

    const beforeHundred = Math.floor(before / 100)
    const afterHundred = Math.floor(after / 100)

    if (beforeHundred === afterHundred) return undefined

    return afterHundred * 100
}


type SessionCountMilestone = AggregateSessionMilestone & {
    date: number
}
/**
 * Get milestones based off of the provided sessions. This will not slice up the provided sessions, unlike {@link getSessionMilestoneFeedItems} which slices by user.
 */
const getSessionCountMilestones = (sessions: OrderedList<Session>): SessionCountMilestone[] => {

    const sortedSessions = sessions.map(session => session.value)
        // Ignore in-progress sessions (milestones should come after a session is finishes)
        .filter(isFinished)
        // Sort by oldest first
        .sort(sortBy<FinishedSession>()('endTime').ascending)

    const milestones: SessionCountMilestone[] = []
    // Cumulative duration climbed
    let duration = 0
    for (let i = 0; i < sortedSessions.length; i++) {
        const session = sortedSessions[i]
        // Check session count for milestone
        if (isMilestoneCount(i + 1)) {
            milestones.push({count: i + 1, date: session.endTime, unit: 'sessionCount'})
        }
        // Check cumulative session duration for milestone
        const sessionDuration = moment(session.endTime).diff(moment(session.startTime), 'hours', true)
        const milestoneDuration = getMilestoneDuration(duration, duration + sessionDuration)
        if (milestoneDuration !== undefined) {
            milestones.push({
                count: milestoneDuration,
                date: session.endTime,
                unit: 'duration'
            })
        }
        // Update running total for duration
        duration = duration + sessionDuration
    }
    return milestones
}