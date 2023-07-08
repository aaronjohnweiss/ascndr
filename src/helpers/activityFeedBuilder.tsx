import {OrderedList, Persisted} from "../types/Firebase";
import {Route, RouteVideo} from "../types/Route";
import {Session} from "../types/Session";
import {groupBy} from "./filterUtils";
import {calculateProjectTimes, Project} from "../components/RoutesIndex";
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
export const buildFeedData = (uid: string, gyms: OrderedList<Gym>, sessions: OrderedList<Session>, users: OrderedList<User>, routes: OrderedList<Route>, workouts: OrderedList<Workout>): FeedItem[] => {
    const feedData = [
        ...getSessionFeedItems(sessions),
        ...getSessionMilestoneFeedItems(sessions),
        ...getGradeMilestoneFeedItems(sessions, routes),
        ...getWorkoutFeedItems(workouts),
        ...getVideoFeedItems(routes),
        ...getProjectFeedItems(routes, sessions),
    ]

    return feedData.sort(buildSort(
        sortBy<FeedItem>()('date').descending,
        // Break ties according to the order of FeedItemTypes: earlier types in the array should come first
        sortBy<FeedItem>()('data', contramap(data => FeedItemTypes.indexOf(data._type))).ascending
    ))
}
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
const getWorkoutFeedItems = (workouts: OrderedList<Workout>): FeedItem[] =>
    workouts.map(workout => ({
        date: workout.value.startTime,
        uid: workout.value.uid,
        data: {
            _type: 'workout',
            value: workout
        }
    }))
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
const getGradeMilestoneFeedItems = (sessions: OrderedList<Session>, routes: OrderedList<Route>): FeedItem[] => {
    const sessionsByUser = groupBy(sessions, 'uid')
    return entries(sessionsByUser).flatMap(([uid, userSessions]) => {
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
const getVideoFeedItems = (routes: OrderedList<Route>): FeedItem[] => {
    return routes.flatMap(({key, value}) => value.videos?.map(video => ({
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
const MIN_PROJECT_SESSIONS = 2
const getProjectFeedItems = (routes: OrderedList<Route>, sessions: OrderedList<Session>): FeedItem[] => {
    const sessionsByUser = groupBy(sessions, 'uid')

    return routes
        .flatMap(route => calculateProjectTimes(route.key, sessionsByUser).map(project => ({
            ...project,
            key: route.key
        })))
        .filter(project => project.isSent)
        .filter(project => project.sessionCount >= MIN_PROJECT_SESSIONS)
        .map(project => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            date: project.sentDate!,
            uid: project.uid,
            link: `/routes/${project.key}`,
            data: {
                _type: 'project',
                value: {
                    routeKey: project.key,
                    project
                }
            }
        }))
}
const lowMilestones = [1, 5, 10, 25, 50, 75]
const isMilestoneCount = (n: number) => lowMilestones.some(milestone => n === milestone) || n % 100 === 0
const getMilestoneDuration = (before: number, after: number): number | undefined => {
    const lowMilestone = lowMilestones.findLast(milestone => before < milestone && milestone <= after);
    if (lowMilestone !== undefined) return lowMilestone

    if (after < 100) return undefined

    const beforeHundred = Math.floor(before / 100)
    const afterHundred = Math.floor(after / 100)

    if (beforeHundred === afterHundred) return undefined

    return afterHundred * 100
}
const getSessionCountMilestones = (sessions: OrderedList<Session>): (AggregateSessionMilestone & {
    date: number
})[] => {

    const sortedSessions = sessions.map(session => session.value)
        .filter(session => session.endTime !== undefined)
        .sort(sortBy<Session>()('endTime').ascending)

    const milestones: (AggregateSessionMilestone & { date: number })[] = []
    let duration = 0
    for (let i = 0; i < sortedSessions.length; i++) {
        const session = sortedSessions[i]
        // Check session count for milestone
        if (isMilestoneCount(i + 1)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            milestones.push({count: i + 1, date: session.endTime!, unit: 'sessionCount'})
        }
        // Check cumulative session duration for milestone
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const sessionDuration = moment(session.endTime!).diff(moment(session.startTime), 'hours', true)
        const milestoneDuration = getMilestoneDuration(duration, duration + sessionDuration)
        if (milestoneDuration !== undefined) {
            milestones.push({
                count: milestoneDuration,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                date: session.endTime!,
                unit: 'duration'
            })
        }
        duration = duration + sessionDuration
    }
    return milestones
}