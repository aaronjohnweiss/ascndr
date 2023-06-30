import {useAppSelector} from "./index";
import {defaultGym, Gym} from "../types/Gym";
import {defaultRoute, Route} from "../types/Route";
import {defaultSession, Session} from "../types/Session";
import {defaultUser, User} from "../types/User";
import {defaultWorkout, Workout} from "../types/Workout";
import {Data, OrderedList, Persisted} from "../types/Firebase";
import {isLoaded} from 'react-redux-firebase'

export const getUser = (): firebase.User => {
    const auth = useAppSelector(state => state.auth)
    if (!auth) {
        throw new Error("uh oh")
    }
    return auth
}

export type Optional<T> = T | undefined
const fillOrdered = <Part, Whole>(ordered: Optional<OrderedList<Part>>, converter: (part: Part) => Whole, predicates: FilterPredicate<Persisted<Whole>>[]): Optional<OrderedList<Whole>> => {
    if (!ordered) return undefined
    const wholes = ordered.map(persisted => ({...persisted, value: converter(persisted.value)}))
    if (predicates.length === 0) {
        return wholes
    }
    const filteredWholes: OrderedList<Whole> = []
    for (const whole of wholes) {
        for (const predicate of predicates) {
            const result = predicate(whole)
            if (result === undefined) {
                return undefined
            }
            if (result) {
                filteredWholes.push(whole)
            }
        }
    }
    return filteredWholes
}


const toData = <Whole extends Filterable>(orderedSelector: ParameterizedSelector<Whole, OrderedList<Whole>>): ParameterizedSelector<Whole, Data<Whole>> => (...params) => {
    const ordered = orderedSelector(...params)
    return ordered && Object.fromEntries(ordered.map((persisted) => [persisted.key, persisted.value] as const))
}

const fillOne = <Part, Whole>(item: Optional<Part>, converter: (part: Part) => Whole): Optional<Whole> => {
    return item && converter(item)
}

export const expectOne = <T,> (arr: Optional<T[]>): Optional<T> => arr?.length ? arr[0] : undefined

const withFilters = <Part, Whole extends Filterable>(selector: () => Optional<OrderedList<Part>>, converter: (part: Part) => Whole, filters: Filter<Whole>): ParameterizedSelector<Whole, OrderedList<Whole>> => (...params) => {
    const filterParams = getFilterParams(params, filters)
    if (filterParams === undefined) {
        return undefined
    }
    return fillOrdered(selector(), converter, filterParams)
}


type NormalizeOptional<IN,OUT> = {
    (y: IN): OUT
    (y: undefined): undefined
    (y: Optional<IN>): Optional<OUT>
}
type NormalizeFilterOverload<T> = NormalizeOptional<string, T> & {
    (y: string[]): T
    (y: FilterValue): T | undefined
}
const normalizeFilterValue = <T,> (func: (x: string[]) => T) => (((y: FilterValue) => {
    if (y === undefined) return undefined
    if (!Array.isArray(y)) y = [y]
    return func(y)
}) as NormalizeFilterOverload<T>)
const getFilterParams = <T extends Filterable>(params: FilterParam<T>[], filters: Filter<T>) => {
    const predicates: FilterPredicate<Persisted<T>>[] = []
    // eslint-disable-next-line prefer-const
    for (let [key, value] of params) {
        const predicate = normalizeFilterValue(filters[key])(value)

        if (predicate) {
            predicates.push(predicate)
        } else {
            return undefined
        }
    }
    return predicates
}

type FilterPredicate<T> = (t: T) => Optional<boolean>
type FilterFunction<T> = (values: string[]) => FilterPredicate<T>

type Filterable = Gym | Route | Session | User | Workout
const FilterableFields = {
    'gym': ['owner', 'editor', 'viewer', 'gymKey'],
    'route': ['gym', 'session'],
    'session': ['gym', 'owner', 'viewer', 'route', 'sessionKey'],
    'user': ['uid', 'friendOf'],
    'workout': ['owner'],
} as const

type FilterName<T extends Filterable> = typeof FilterableFields[T['_type']][number]

type Filter<T extends Filterable> = Record<FilterName<T>, FilterFunction<Persisted<T>>>

type FilterValue = Optional<string | string[]>

export type FilterParam<T extends Filterable> = [FilterName<T>, FilterValue]

type ParameterizedSelector<Whole extends Filterable, WrappedData extends OrderedList<Whole> | Data<Whole>> = (...params: FilterParam<Whole>[]) => Optional<WrappedData>

export const isFriendOf = normalizeFilterValue((friendUids: string[]): FilterPredicate<string> => {
    const users = firebaseState.users.getOrdered(['uid', friendUids])

    if (!isLoaded(users)) return () => undefined

    return (uid: string) => users.some(u => u.value.friends.includes(uid) || friendUids.includes(uid))
})

export const hasFriend = normalizeFilterValue((friendUids: string[]): FilterPredicate<string> => (uid: string) => {
    const user = firebaseState.users.getOne(uid)

    if (!isLoaded(user)) return undefined

    return friendUids.some(friend => user.friends.includes(friend))
})
export const canEditGym = ((gym: Optional<Gym>) => isFriendOf(gym?.owner)) as (NormalizeOptional<Gym, FilterPredicate<string>>)

const gymFilters: Filter<Gym> = {
    'owner': (owners: string[]) => (gym) => owners.includes(gym.value.owner),
    'editor': (editors: string[]) => (gym) => editors.some(canEditGym(gym.value)),
    'viewer': (viewers: string[]) =>  (gym) => viewers.some(hasFriend(gym.value.owner)),
    'gymKey': (gymKeys: string[]) => (gym) => gymKeys.includes(gym.key),
}

const routeFilters: Filter<Route> = {
    'gym': (gymKeys: string[]) => (route) => gymKeys.includes(route.value.gymId),
    'session': (sessionKeys: string[]) => (route) => {
        const sessionsForRoute = firebaseState.sessions.getOrdered(['sessionKey', sessionKeys], ['route', route.key])

        if (!isLoaded(sessionsForRoute)) return undefined

        return sessionsForRoute.length > 0
    }
}

const sessionFilters: Filter<Session> = {
    'gym': (gymKeys: string[]) => (session) => gymKeys.includes(session.value.gymId),
    'owner': (owners: string[]) => (session) => owners.includes(session.value.uid),
    'viewer': (viewers: string[]) => (session) => viewers.some(hasFriend(session.value.uid)),
    'route': (routeKeys: string[]) => (session) => session.value.customRoutes && session.value.customRoutes.some(route => routeKeys.includes(route.key)),
    'sessionKey': (sessionKeys: string[]) => session => sessionKeys.includes(session.key)
}

const userFilters: Filter<User> = {
    'uid': (uids: string[]) => (user) => uids.includes(user.value.uid),
    'friendOf': (uids) => user => isFriendOf(uids)(user.value.uid),
    // 'friendOf': (friendUids: string[]) => {
    //     const users = firebaseState.users.getOrdered(['uid', friendUids])
    //
    //     if (!isLoaded(users)) return () => undefined
    //
    //     return (user) => users.some(u => u.value.friends.includes(user.value.uid) || friendUids.includes(user.value.uid))
    // }
}

const workoutFilters: Filter<Workout> = {
    'owner': (owners: string[]) => (workout) => owners.includes(workout.value.uid)
}

const orderedState = {
    getGyms: withFilters(() => useAppSelector(state => state.firebase.ordered.gyms), defaultGym, gymFilters),
    getRoutes: withFilters(() => useAppSelector(state => state.firebase.ordered.routes), defaultRoute, routeFilters),
    getSessions: withFilters(() => useAppSelector(state => state.firebase.ordered.sessions), defaultSession, sessionFilters),
    getUsers: withFilters(() => useAppSelector(state => state.firebase.ordered.users), defaultUser, userFilters),
    getWorkouts: withFilters(() => useAppSelector(state => state.firebase.ordered.workouts), defaultWorkout, workoutFilters),
}
export const firebaseState = {
    gyms: {
        getOrdered: orderedState.getGyms,
        getData: toData(orderedState.getGyms),
        getOne: (id: string) => fillOne(useAppSelector(state => state.firebase.data?.gyms?.[id]), defaultGym)
    },
    routes: {
        getOrdered: orderedState.getRoutes,
        getData: toData(orderedState.getRoutes),
        getOne: (id: string) => fillOne(useAppSelector(state => state.firebase.data?.routes?.[id]), defaultRoute)
    },
    sessions: {
        getOrdered: orderedState.getSessions,
        getData: toData(orderedState.getSessions),
        getOne: (id: string) => fillOne(useAppSelector(state => state.firebase.data?.sessions?.[id]), defaultSession)
    },
    users: {
        getOrdered: orderedState.getUsers,
        getData: toData(orderedState.getUsers),
        getOne: (uid: string) => {
            const users = orderedState.getUsers(['uid', uid])
            if (users === undefined) {
                return undefined
            }
            if (users.length === 0) {
                return defaultUser({uid})
            }
            return expectOne(users)?.value
        }
    },
    workouts: {
        getOrdered: orderedState.getWorkouts,
        getData: toData(orderedState.getWorkouts),
    },
}
