import {isEmpty} from 'react-redux-firebase';
import {Gym} from "../types/Gym";
import {missingUser, User} from "../types/User";
import {OrderedList, Persisted} from "../types/Firebase";
import {Route} from "../types/Route";
import {Session} from "../types/Session";
import {Workout} from "../types/Workout";

export const filterList = <T,U >(arr: OrderedList<T>, field: keyof T, value: U): OrderedList<T> => isEmpty(arr) ? [] : arr.filter(item => {
    let fieldArray: unknown[];
    const itemValue = item.value[field];
    if (!Array.isArray(itemValue)) {
        fieldArray = [itemValue];
    } else {
        fieldArray = itemValue
    }

    let valueArray: unknown[];
    if (!Array.isArray(value)) {
        valueArray = [value];
    } else {
        valueArray = value;
    }
    return fieldArray.some(x => valueArray.includes(x));
});

export const findEntry = <T,>(array: OrderedList<T>, key: string): Persisted<T> | undefined => array.find(item => item.key === key);
export const userExists = (users: OrderedList<User>, uid: string): boolean => users.some(user => user.value.uid === uid)
export const findUser = (users: OrderedList<User>, uid: string, fallback: User = missingUser(uid)) => {
    const user = isEmpty(users) ? undefined : users.find(user => user.value.uid === uid);
    return user ? user.value : fallback;
}
export const findUserKey = (users: OrderedList<User>, uid: string): string | null => {
    const user = isEmpty(users) ? undefined : users.find(user => user.value.uid === uid);
    return user ? user.key : null;
}

export const getUserName = (user: User): string => user.name || user.uid

export const findFriends = (users: OrderedList<User>, uid: string, includeSelf = true): string[] => {
    const friends = findUser(users, uid).friends || []

    return includeSelf ? [uid, ...friends] : friends
}

// users depend on auth
// gyms depend on users
// routes depend on gyms
// sessions depend on users and routes



// gyms.getData({owner, editor, viewer})
// routes.getData({gym})
// sessions.getData({gym, owner, viewer, route})
// users.getData({friendOf})
// users.getOne({uid})
// workoutes.getData({owner})
export const getGymsForUser = (gyms: OrderedList<Gym>, users: OrderedList<User>, uid: string) => {
    const allowedUids = findFriends(users, uid);

    return filterList(gyms, 'owner', allowedUids);
}

export const getEditGymsForUser = (gyms: OrderedList<Gym>, users: OrderedList<User>, uid: string): OrderedList<Gym> => gyms.filter(gym => canEditGym(gym.value, users, uid))

export const getEditorsForGym = (gym: Gym, users: OrderedList<User>) => {
    return findFriends(users, gym.owner);
}

export const canEditGym = (gym: Gym, users: OrderedList<User>, uid: string): boolean => getEditorsForGym(gym, users).includes(uid)

export const getFriendsForUser = (user: User, users: OrderedList<User>): User[] => findFriends(users, user.uid, false).map(uid => findUser(users, uid))

export const getRoutesForGym = (routes: OrderedList<Route>, gymId: string): OrderedList<Route> => filterList(routes, 'gymId', gymId);
export const getSessionsForGym = (sessions: OrderedList<Session>, gymId: string): OrderedList<Session> => filterList(sessions, 'gymId', gymId);
export const getSessionsForUser = (sessions: OrderedList<Session>, uid: string): OrderedList<Session> => filterList(sessions, 'uid', uid);
export const getSessionsForUserAndGym = (sessions: OrderedList<Session>, gymId: string, uid: string) => getSessionsForUser(getSessionsForGym(sessions, gymId), uid);
export const getSessionsForRoute = (sessions: OrderedList<Session>, routeKey: string): OrderedList<Session> => isEmpty(sessions) ? [] : sessions.filter(session => {
    const { customRoutes } = session.value;
    if (!customRoutes || !customRoutes.length) {
        return false;
    }
    return customRoutes.some(route => route.key === routeKey);
});

export const getWorkoutsForUser = (workouts: OrderedList<Workout>, uid: string): OrderedList<Workout> => filterList(workouts, 'uid', uid);

export const hasRoutes = (session: Session): boolean => (session.customRoutes && session.customRoutes.length > 0) || (session.standardRoutes && session.standardRoutes.length > 0);

export const getLatestSession = (sessions: OrderedList<Session> = []): Persisted<Session> | null => sessions.reduce((prev: Persisted<Session> | null, current) => (prev && prev.value && prev.value.startTime > current.value.startTime) ? prev : current, null);

export const distinct = <T,>(values: T[]): T[] => [...new Set(values)]