import moment from "moment";
import {dateString} from "./dateUtils";
import {routeCountForSession} from "../components/StatsIndex";
import {ALL_STYLES} from "./gradeUtils";
import {percentile} from "./mathUtils";
import {WORKOUT_CATEGORIES} from "./workouts";
import {CalendarMode, getPreferences} from "../components/ActivityCalendarSettingsModal";
import {findUser, getSessionsForUser, getUserName, getWorkoutsForUser} from "./filterUtils";

export const getEmptyCounts = cutoffDate => {
    const tmpDate = cutoffDate.clone();
    const now = moment();
    const emptyCounts = {};
    while (tmpDate.isBefore(now)) {
        emptyCounts[dateString(tmpDate.valueOf())] = {count: 0, level: 0};
        tmpDate.add(1, 'day');
    }
    return emptyCounts;
}

export const reduceCount = (acc = 0, count = 0) => count + acc
export const reduceLevel = (acc = 0, level = 0) => Math.max(level, acc)

export const buildCounts = ({data, getTime = x => x.startTime, getCount = () => 1, getLevel = () => 0, cutoffDate}) =>
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

export const getLevelByPercentile = (data) => {
    const allCounts = data.map(x => x.count).filter(val => val > 0).sort((a, b) => a - b);
    const q25 = percentile(allCounts, 0.25);
    const q50 = percentile(allCounts, 0.50);
    const q75 = percentile(allCounts, 0.75);

    return count => {
        if (count === 0) return 0;
        if (count <= q25) return 1;
        if (count <= q50) return 2;
        if (count <= q75) return 3;
        return 4;
    }
}

const buildArray = map => Object.entries(map)
    .map(([date, {count, level}]) => ({date, count, level}))
    .sort((a, b) => a.date.localeCompare(b.date));

const getData = (ctx) => buildArray(buildCounts(ctx));

const getDataWithPercentiles = (ctx) => {
    const data = getData(ctx)

    const getLevel = getLevelByPercentile(data)

    return data.map(x => ({
        ...x,
        level: getLevel(x.count)
    }));
}

const excludeEmpty = data => data.filter(x => x.data.some(day => day.level > 0))

const mergeData = ({data, label}) => {
    const dataByDay = data.map(x => x.data).flat().reduce((acc, entry) => ({
        ...acc,
        [entry.date]: {
            count: reduceCount(acc[entry.date] && acc[entry.date].count, entry.count),
            level: reduceLevel(acc[entry.date] && acc[entry.date].level, entry.level)
        }
    }), {});

    return [{label, data: buildArray(dataByDay)}];
}

export const getCalendarData = ({user, users, sessions, routes, workouts, cutoffDate}) => {
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

export const getUserData = ({user, preferences, sessions, routes, workouts, cutoffDate}) => [
    ...getSessionData({sessions: getSessionsForUser(sessions, user.uid), routes, cutoffDate}),
    ...getWorkoutData({workouts: getWorkoutsForUser(workouts,  user.uid), cutoffDate, preferences}),
]

export const getSessionData = ({sessions, routes, cutoffDate}) => {
    const sessionData = getDataWithPercentiles({
        data: sessions.map(x => x.value),
        cutoffDate,
        getCount: session => routeCountForSession(session, routes, ALL_STYLES, true)
    })

    return [{label: 'Climbing', data: sessionData}]
}

export const getWorkoutData = ({workouts, cutoffDate, preferences}) => {
    if (!preferences.includeWorkouts) return []

    const allWorkoutData = excludeEmpty(WORKOUT_CATEGORIES.map(category => ({
        label: category,
        data: getData({
            data: workouts.map(x => x.value).filter(workout => workout.categories.includes(category)),
            cutoffDate,
            getLevel: workout => workout.intensity
        })
    })))

    if (!preferences.splitWorkouts) return mergeData({data: allWorkoutData, label: 'Workout'})
    return allWorkoutData
}