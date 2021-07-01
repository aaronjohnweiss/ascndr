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

export const getGroupsForUser = (groups, uid) => filterList(groups, 'users', uid);
export const getGymsForGroups = (gyms, groups) => filterList(gyms, 'groupId', groups.map(group => group.key));
export const getGymsForUser = (gyms, groups, uid) => getGymsForGroups(gyms, getGroupsForUser(groups, uid));

export const getRoutesForGym = (routes, gym) => filterList(routes, 'gymId', gym.key);
export const getSessionsForGym = (sessions, gym) => filterList(sessions, 'gymId', gym.key);