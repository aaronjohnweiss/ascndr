import React, {useEffect, useState} from 'react'
import {getUser, useDatabase} from "../redux/selectors/selectors";
import {isLoaded} from 'react-redux-firebase'
import {OrderedList, Persisted} from "../types/Firebase";
import {Gym} from "../types/Gym";
import {Session} from "../types/Session";
import {User} from "../types/User";
import {Route, RouteVideo} from "../types/Route";
import {Workout} from "../types/Workout";
import {buildSort, contramap, sortBy} from "../helpers/sortUtils";
import {SessionCard, SessionIcon} from "../components/activity-feed/SessionCard";
import {toObj} from "../helpers/objectConverters";
import {findUser, groupBy} from "../helpers/filterUtils";
import {entries} from "../helpers/recordUtils";
import {MilestoneCard, MilestoneIcon} from "../components/activity-feed/MilestoneCard";
import moment from "moment";
import {Card, Col, Container, Row} from "react-bootstrap";
import {preciseTimeFromNow} from "../helpers/dateUtils";
import assertNever from "assert-never/index";
import {Optional} from "../redux/selectors/types";
import {LinkContainer} from 'react-router-bootstrap'
import {calculateProgression} from "../components/GradeHistory";
import {ALL_STYLES} from "../helpers/gradeUtils";
import {Grade} from "../types/Grade";
import {WorkoutCard} from "../components/activity-feed/WorkoutCard";
import {VideoCard} from "../components/activity-feed/VideoCard";
import InfiniteScroll from "react-infinite-scroll-component";
import {useHistory, useLocation} from "react-router-dom";
import {getNumberFromQuery, getQuery} from "../helpers/queryParser";
import {calculateProjectTimes, Project} from "../components/RoutesIndex";
import {ProjectCard, ProjectIcon} from "../components/activity-feed/ProjectCard";


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

type FeedItem = {
    date: number,
    uid: string,
    link?: string,
    data: FeedData
}

type FeedItemType = FeedData['_type']

const FeedItemTypes: FeedItemType[] = [
    'project',
    'milestone',
    'video',
    'session',
    'workout',
]

const buildFeedData = (uid: string, gyms: OrderedList<Gym>, sessions: OrderedList<Session>, users: OrderedList<User>, routes: OrderedList<Route>, workouts: OrderedList<Workout>): FeedItem[] => {
    const feedData = [
        ...getSessionFeedItems(sessions),
        ...getSessionCountFeedItems(sessions),
        ...getSessionDurationFeedItems(sessions),
        ...getGradeMilestoneFeedItems(sessions, routes),
        ...getWorkoutFeedItems(workouts),
        ...getVideoFeedItems(routes),
        ...getProjectFeedItems(routes, sessions),
    ]

    return feedData.sort(buildSort(
        sortBy<FeedItem>()('date').descending,
        // Break ties according to the order of FeedItemTypes: earlier types in the array should come first
        sortBy<FeedItem>()('data', contramap('_type', (t1, t2) => FeedItemTypes.indexOf(t1) - FeedItemTypes.indexOf(t2))).ascending
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
const getSessionCountFeedItems = (sessions: OrderedList<Session>): FeedItem[] => {
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
const getSessionDurationFeedItems = (sessions: OrderedList<Session>): FeedItem[] => {
    const sessionsByUser = groupBy(sessions, 'uid')
    return entries(sessionsByUser).flatMap(([uid, userSessions]) => {
        const milestones = getSessionDurationMilestones(userSessions)
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
    for (let i = 0; i < sortedSessions.length; i++) {
        if (isMilestoneCount(i + 1)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            milestones.push({count: i + 1, date: sortedSessions[i].endTime!, unit: 'sessionCount'})
        }
    }
    return milestones
}

const getSessionDurationMilestones = (sessions: OrderedList<Session>): (AggregateSessionMilestone & {
    date: number
})[] => {

    const sortedSessions = sessions.map(session => session.value)
        .filter(session => session.endTime !== undefined)
        .sort(sortBy<Session>()('endTime').ascending)

    const milestones: (AggregateSessionMilestone & { date: number })[] = []
    let duration = 0
    for (const sortedSession of sortedSessions) {
        const sessionDuration = moment(sortedSession.endTime!).diff(moment(sortedSession.startTime), 'h', true)
        const milestoneDuration = getMilestoneDuration(duration, duration + sessionDuration)
        if (milestoneDuration !== undefined) {
            milestones.push({
                count: milestoneDuration,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                date: sortedSession.endTime!,
                unit: 'duration'
            })
        }
        duration = duration + sessionDuration
    }

    return milestones
}

const PAGE_SIZE = 20
const DEFAULT_ITEMS = PAGE_SIZE * 3

const ActivityFeed = () => {
    const {uid} = getUser()
    const firebaseState = useDatabase()
    const gyms = firebaseState.gyms.getOrdered(['viewer', uid])
    const sessions = firebaseState.sessions.getOrdered(['viewer', uid])
    const users = firebaseState.users.getOrdered(['friendOf', uid])
    const routes = firebaseState.routes.getOrdered(['viewer', uid])
    const workouts = firebaseState.workouts.getOrdered(['viewer', uid])

    const history = useHistory()
    const location = useLocation()

    const [feedLength, setFeedLength] = useState(getNumberFromQuery(getQuery(location), 'n', DEFAULT_ITEMS))

    useEffect(
        () => {
            history.replace({pathname: location.pathname, search: `?n=${feedLength}`})
        }, [feedLength]
    )

    if (!isLoaded(gyms) || !isLoaded(sessions) || !isLoaded(users) || !isLoaded(routes) || !isLoaded(workouts)) return <></>

    const feedData = buildFeedData(uid, gyms, sessions, users, routes, workouts)

    return (
        <div className='activity-feed'>
            <InfiniteScroll next={() => setFeedLength((len) => len + PAGE_SIZE)} hasMore={feedLength < feedData.length}
                            dataLength={feedLength} loader={<></>}>
                {feedData.slice(0, feedLength).map((feedItem, idx) => {
                    let cardContent: JSX.Element;
                    let cardIcon: Optional<JSX.Element>;
                    switch (feedItem.data._type) {
                        case "session":
                            cardContent =
                                <SessionCard session={feedItem.data.value} gyms={toObj(gyms)} routes={toObj(routes)}/>
                            cardIcon = <SessionIcon session={feedItem.data.value}/>
                            break
                        case "milestone":
                            cardContent = <MilestoneCard milestone={feedItem.data.value}/>
                            cardIcon = <MilestoneIcon/>
                            break
                        case 'workout':
                            cardContent = <WorkoutCard workout={feedItem.data.value}/>
                            break
                        case 'video':
                            cardContent =
                                <VideoCard routeKey={feedItem.data.value.routeKey} video={feedItem.data.value.video}
                                           routes={toObj(routes)} gyms={toObj(gyms)}/>
                            break
                        case 'project':
                            cardContent =
                                <ProjectCard routeKey={feedItem.data.value.routeKey}
                                             project={feedItem.data.value.project} routes={toObj(routes)}/>
                            cardIcon = <ProjectIcon/>
                            break
                        default:
                            assertNever(feedItem.data)
                    }
                    const card = <Card key={idx}>
                        <Card.Body>
                            <Container>
                                <Row>
                                    <Col xs={10}>
                                        <Card.Title
                                            className={'w-100'}>{uid === feedItem.uid ? 'You' : findUser(users, feedItem.uid).name}</Card.Title>
                                        <Card.Subtitle>{preciseTimeFromNow(feedItem.date)}</Card.Subtitle>
                                    </Col>
                                    {cardIcon !== undefined &&
                                        <Col xs={2} className={'d-flex flex-row justify-content-end'}>{cardIcon}</Col>}
                                </Row>
                            </Container>
                            <Card.Text as={'div'}>{cardContent}</Card.Text>
                        </Card.Body>
                    </Card>
                    return (feedItem.link !== undefined ?
                        <LinkContainer key={idx} to={feedItem.link}>{card}</LinkContainer> : card)

                })}
            </InfiniteScroll>
        </div>
    )

}

export default ActivityFeed
