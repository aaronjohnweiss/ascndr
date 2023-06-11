import moment from "moment";
import {dateString} from "./dateUtils";
import {routeCountForSession} from "../components/StatsIndex";
import {ALL_STYLES} from "./gradeUtils";
import {percentile} from "./mathUtils";
import {WORKOUT_CATEGORIES} from "./workouts";
import {getPreferences} from "../components/ActivityCalendarSettingsModal";
import {findUser, getSessionsForUser, getUserName, getWorkoutsForUser} from "./filterUtils";
import {ActivityCalendarPreferences, CalendarMode, User} from "../types/User";
import {Data, OrderedList} from "../types/Firebase";
import {Session} from "../types/Session";
import {Route} from "../types/Route";
import {Workout} from "../types/Workout";

interface Count {
    count: number,
    level: number,
}

export interface CountForDate extends Count {
    date: string
}

export interface MultiCountForDate {
    date: string
    counts: number[]
    levels: number[]
}

export interface LabeledData {
    label: string,
    data: CountForDate[]
}
export const getEmptyCounts = (cutoffDate: moment.Moment) => {
    const tmpDate = cutoffDate.clone();
    const now = moment();
    const emptyCounts: Record<string, Count> = {};
    while (tmpDate.isBefore(now)) {
        emptyCounts[dateString(tmpDate.valueOf())] = {count: 0, level: 0};
        tmpDate.add(1, 'day');
    }
    return emptyCounts;
}

export const reduceCount = (acc = 0, count = 0) => count + acc
export const reduceLevel = (acc = 0, level = 0) => Math.max(level, acc)

interface BuildCountCtx<T> {
    data: T[]
    getTime: (x: T) => number,
    getCount?: (x: T) => number,
    getLevel?: (x: T) => number,
    cutoffDate: moment.Moment
}
export const buildCounts = <T,>({data, getTime, getCount = () => 1, getLevel = () => 0, cutoffDate}: BuildCountCtx<T>): Record<string, Count> =>
    data.filter(x => cutoffDate.isBefore(moment(getTime(x))))
        .map(x => ({
            date: dateString(getTime(x)),
            count: getCount(x),
            level: getLevel(x),
        }))
        .reduce((acc, entry) => ({
            ...acc,
            [entry.date]: {
                count: reduceCount(acc[entry.date].count, entry.count),
                level: reduceLevel(acc[entry.date].level, entry.level)
            }
        }), getEmptyCounts(cutoffDate));

export const getLevelByPercentile = (data: CountForDate[]) => {
    const allCounts = data.map(x => x.count).filter(val => val > 0).sort((a, b) => a - b);
    const q25 = percentile(allCounts, 0.25);
    const q50 = percentile(allCounts, 0.50);
    const q75 = percentile(allCounts, 0.75);

    return (count: number) => {
        if (count === 0) return 0;
        if (count <= q25) return 1;
        if (count <= q50) return 2;
        if (count <= q75) return 3;
        return 4;
    }
}

const buildArray = (map: Record<string, Count>): CountForDate[] => Object.entries(map)
    .map(([date, {count, level}]) => ({date, count, level}))
    .sort((a, b) => a.date.localeCompare(b.date));

const getData = <T,> (ctx: BuildCountCtx<T>): CountForDate[] => buildArray(buildCounts(ctx));

const getDataWithPercentiles = <T,> (ctx: BuildCountCtx<T>) => {
    const data = getData(ctx)

    const getLevel = getLevelByPercentile(data)

    return data.map(x => ({
        ...x,
        level: getLevel(x.count)
    }));
}

const excludeEmpty = (arr: LabeledData[]) => arr.filter(x => x.data.some(day => day.level > 0))

const mergeData = ({data, label}: {data: LabeledData[], label: string}): LabeledData[] => {
    const dataByDay = data.map(x => x.data).flat().reduce((acc, entry) => ({
        ...acc,
        [entry.date]: {
            count: reduceCount(acc[entry.date] && acc[entry.date].count, entry.count),
            level: reduceLevel(acc[entry.date] && acc[entry.date].level, entry.level)
        }
    }), {} as Record<string, Count>);

    return [{label, data: buildArray(dataByDay)}];
}

export interface Ctx {
    user: User
    users: OrderedList<User>
    sessions: OrderedList<Session>
    routes: Data<Route>
    workouts: OrderedList<Workout>
    cutoffDate: moment.Moment
    preferences: ActivityCalendarPreferences
}

export const getCalendarData = ({user, users, sessions, routes, workouts, cutoffDate}: Omit<Ctx, 'preferences'>): LabeledData[] => {
    const preferences = getPreferences(user)

    if (preferences.mode === CalendarMode.FRIENDS) {
        const usersForCalendar = [user, ...preferences.friends.map(uid => findUser(users, uid))]
        const userData = usersForCalendar
            .map(u => mergeData({data: getUserData({user: u, preferences, sessions, routes, workouts, cutoffDate}), label: getUserName(u)}))
            .flat()
        return excludeEmpty(userData)
    } else {
        return excludeEmpty(getUserData({user, preferences, sessions, routes, workouts, cutoffDate}))
    }
}

export const getUserData = ({user, preferences, sessions, routes, workouts, cutoffDate}: Pick<Ctx, 'user' | 'preferences' | 'sessions' | 'routes' | 'workouts' | 'cutoffDate'>) => [
    ...getSessionData({sessions: getSessionsForUser(sessions, user.uid), routes, cutoffDate}),
    ...getWorkoutData({workouts: getWorkoutsForUser(workouts,  user.uid), cutoffDate, preferences}),
]

export const getSessionData = ({sessions, routes, cutoffDate}: Pick<Ctx, 'sessions' | 'routes' | 'cutoffDate'>) => {
    const sessionData = getDataWithPercentiles({
        data: sessions.map(x => x.value),
        cutoffDate,
        getTime: session => session.startTime,
        getCount: session => routeCountForSession(session, routes, [...ALL_STYLES], true)
    })

    return [{label: 'Climbing', data: sessionData}]
}

export const getWorkoutData = ({workouts, cutoffDate, preferences}: Pick<Ctx, 'workouts' | 'cutoffDate' | 'preferences'>) => {
    if (!preferences.includeWorkouts) return []

    const allWorkoutData = excludeEmpty(WORKOUT_CATEGORIES.map(category => ({
        label: category,
        data: getData({
            data: workouts.map(x => x.value).filter(workout => workout.categories.includes(category)),
            cutoffDate,
            getTime: workout => workout.startTime,
            getLevel: workout => workout.intensity,
        })
    })))

    if (!preferences.splitWorkouts) return mergeData({data: allWorkoutData, label: 'Workout'})
    return allWorkoutData
}