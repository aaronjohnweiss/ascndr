import { isEmpty } from 'react-redux-firebase';

export const filterList = (arr, field, value) => isEmpty(arr) ? [] : arr.filter(item => {
    let fieldValue = item.value[field];
    if (!Array.isArray(fieldValue)) {
        fieldValue = [fieldValue];
    }
    if (!Array.isArray(value)) {
        value = [value];
    }
    return fieldValue.some(x => value.includes(x));
});

export const findEntry = (array, key) => array.find(item => item.key === key);
export const findUser = (users, uid) => {
    const user = isEmpty(users) ? undefined : users.find(user => user.value.uid === uid);
    return user ? user.value : { uid };
}

export const getGroupsForUser = (groups, uid) => filterList(groups, 'users', uid);
export const getGymsForGroups = (gyms, groups) => filterList(gyms, 'groupId', groups.map(group => group.key));
export const getGymsForUser = (gyms, groups, uid) => getGymsForGroups(gyms, getGroupsForUser(groups, uid));

export const getRoutesForGym = (routes, gym) => filterList(routes, 'gymId', gym.key);
export const getSessionsForGym = (sessions, gym) => filterList(sessions, 'gymId', gym.key);
export const getSessionsForUser = (sessions, uid) => filterList(sessions, 'uid', uid);
export const getSessionsForUserAndGym = (sessions, gym, uid) => getSessionsForUser(getSessionsForGym(sessions, gym), uid);
export const getSessionsForRoute = (sessions, routeKey) => isEmpty(sessions) ? [] : sessions.filter(session => {
    let { customRoutes } = session.value;
    if (!customRoutes || !customRoutes.length) {
        return false;
    }
    return customRoutes.some(route => route.key === routeKey);
});

export const hasRoutes = (session) => (session.customRoutes && session.customRoutes.length > 0) || (session.standardRoutes && session.standardRoutes.length > 0);

export const getLatestSession = (sessions = []) => sessions.reduce((prev, current) => (prev && prev.value && prev.value.startTime > current.value.startTime) ? prev : current, null);