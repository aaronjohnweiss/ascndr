import {useAppSelector} from "./index";
import {defaultGym, Gym} from "../types/Gym";
import {defaultRoute, Route} from "../types/Route";
import {defaultSession, Session} from "../types/Session";
import {defaultUser, User} from "../types/User";
import {defaultWorkout, Workout} from "../types/Workout";
import {Data, OrderedList, Persisted} from "../types/Firebase";
import {isLoaded, useFirebaseConnect} from 'react-redux-firebase'

export const getUser = (): firebase.User => {
    const auth = useAppSelector(state => state.auth)
    if (!auth) {
        throw new Error("uh oh")
    }
    return auth
}

export type Optional<T> = T | undefined

/**
 * Given an ordered list of data, apply the filters. Returns undefined if any predicate returns undefined, or the filtered list otherwise.
 */
const filterOrdered = <T, >(ordered: Optional<OrderedList<T>>, predicates: FilterPredicate<Persisted<T>>[]): Optional<OrderedList<T>> => {
    if (!ordered) return undefined
    if (predicates.length === 0) {
        return ordered
    }
    const filteredList: OrderedList<T> = []
    for (const obj of ordered) {
        const result = evaluatePredicates(obj, predicates)
        if (result === undefined) {
            return undefined
        }
        if (result) {
            filteredList.push(obj)
        }
    }
    return filteredList
}

/**
 * Evaluate all provided predicates on the given object. Returns:
 * 1. undefined if any predicate returns undefined
 * 2. false if any predicate returns false
 * 3. true otherwise
 */
const evaluatePredicates = <T, >(obj: Persisted<T>, predicates: FilterPredicate<Persisted<T>>[]): Optional<boolean> => {
    let result = true
    for (const predicate of predicates) {
        const predicateResult = predicate(obj)
        if (predicateResult === undefined) {
            return undefined
        }
        result = predicateResult && result
    }
    return result
}


/**
 * Convert a function that returns an OrderedList to one that returns Data
 * @param orderedSelector
 */
const toData = <Whole extends Filterable>(orderedSelector: ParameterizedSelector<Whole, OrderedList<Whole>>): ParameterizedSelector<Whole, Data<Whole>> => (...params) => {
    const ordered = orderedSelector(...params)
    return ordered && Object.fromEntries(ordered.map((persisted) => [persisted.key, persisted.value] as const))
}

/**
 * Get the 0th element, or undefined if there is no 0th element
 */
export const getFirst = <T, >(arr: Optional<T[]>): Optional<T> => arr?.length ? arr[0] : undefined

/**
 * Build a function that can filter on the provided data
 */
const getFilterable = <T extends Filterable>(selector: Optional<OrderedList<T>>, filters: Filter<T>): ParameterizedSelector<T, OrderedList<T>> => (...params) => {
    const predicates = getPredicates(params, filters)
    if (predicates === undefined) {
        return undefined
    }
    return filterOrdered(selector, predicates)
}

/**
 * Retrieve values from the given selector, and fill in default values based on the provided converter
 */
const withDefault = <Part, Whole extends Filterable>(selector: () => Optional<OrderedList<Part>>, converter: (part: Part) => Whole): Optional<OrderedList<Whole>> => selector()?.map(persisted => ({
    ...persisted,
    value: converter(persisted.value)
}))

/**
 * Wrap a function that takes (string[] | undefined) into one that takes (string | string[] | undefined), for caller convenience
 */
const normalizeFilterValue = <T, >(func: (x: Optional<string[]>) => T) => (((y: FilterValue) => {
    if (y !== undefined && !Array.isArray(y)) y = [y]
    return func(y)
}))

/**
 * Build a set of predicates that match the provided params
 */
const getPredicates = <T extends Filterable>(params: FilterParam<T>[], filters: Filter<T>) => {
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

/**
 * Predicate that can also return undefined, to indicate that data is still loading
 */
type FilterPredicate<T> = (t: T) => Optional<boolean>
/**
 * Function that takes filter arguments and returns a FilterPredicate
 */
type FilterFunction<T> = (values: Optional<string[]>) => FilterPredicate<T>

/**
 * Object that can be filtered upon; should define a constant _type for disambiguation
 */
type Filterable = Gym | Route | Session | User | Workout
type FilterableType = Filterable['_type']
/**
 * All filters that can be provided for each type
 */
const FilterableFields: Record<FilterableType, readonly string[]> = {
    'gym': ['owner', 'editor', 'viewer', 'gymKey'],
    'route': ['gym', 'session'],
    'session': ['gym', 'owner', 'viewer', 'route', 'sessionKey'],
    'user': ['uid', 'friendOf'],
    'workout': ['owner'],
} as const

/**
 * All applicable filters for a given Filterable type
 */
type FilterName<T extends Filterable> = typeof FilterableFields[T['_type']][number]

/**
 * A Filter defines FilterFunctions for every FilterName for a given Filterable type
 */
type Filter<T extends Filterable> = Record<FilterName<T>, FilterFunction<Persisted<T>>>
/**
 * A StateFilter wraps a filter in a closure that has stateful information
 */
type StateFilter<T extends Filterable> = (databaseState: DatabaseState) => Filter<T>

/**
 * Callers can supply a string, string[], or undefined for a filter.
 */
type FilterValue = Optional<string | string[]>

/**
 * User-supplied filter parameter. In the case of multiple values provided to FilterValue, they will be OR'ed
 */
export type FilterParam<T extends Filterable> = [FilterName<T>, FilterValue]

/**
 * Function that will take in filter parameters and return the relevant data
 */
type ParameterizedSelector<Whole extends Filterable, WrappedData extends OrderedList<Whole> | Data<Whole>> = (...params: FilterParam<Whole>[]) => Optional<WrappedData>

const gymFilters: StateFilter<Gym> = databaseState => ({
    'owner': (owners?: string[]) => (gym) => owners?.includes(gym.value.owner),
    // An editor must be on the owner's friends list
    'editor': (editors?: string[]) => (gym) => {
        const canEdit = databaseState.gyms.canEdit(gym.value)
        return editors?.some(canEdit);
    },
    // A viewer must have the owner on the viewer's friends list
    'viewer': (viewers?: string[]) => (gym) => {
        const hasOwnerAsFriend = databaseState.users.hasFriend(gym.value.owner)
        return viewers?.some(hasOwnerAsFriend);
    },
    'gymKey': (gymKeys?: string[]) => (gym) => gymKeys?.includes(gym.key),
})

const routeFilters: StateFilter<Route> = databaseState => ({
    'gym': (gymKeys?: string[]) => (route) => gymKeys?.includes(route.value.gymId),
    // All routes which were climbed in the given sessions
    'session': (sessionKeys?: string[]) => (route) => {
        const sessionsForRoute = databaseState.sessions.getOrdered(['sessionKey', sessionKeys], ['route', route.key])

        if (!isLoaded(sessionsForRoute)) return undefined

        return sessionsForRoute.length > 0
    }
})

const sessionFilters: StateFilter<Session> = databaseState => ({
    'gym': (gymKeys?: string[]) => (session) => gymKeys?.includes(session.value.gymId),
    'owner': (owners?: string[]) => (session) => owners?.includes(session.value.uid),
    // A viewer must have the owner on the viewer's friends list
    'viewer': (viewers?: string[]) => (session) => {
        const hasOwnerAsFriend = databaseState.users.hasFriend(session.value.uid)
        return viewers?.some(hasOwnerAsFriend);
    },
    // All sessions in which the given routes were climbed
    'route': (routeKeys?: string[]) => (session) => routeKeys ? session.value.customRoutes && session.value.customRoutes.some(route => routeKeys.includes(route.key)) : undefined,
    'sessionKey': (sessionKeys?: string[]) => session => sessionKeys?.includes(session.key)
})

const userFilters: StateFilter<User> = databaseState => ({
    'uid': (uids?: string[]) => (user) => uids?.includes(user.value.uid),
    'friendOf': (uids) => user => databaseState.users.isFriendOf(uids)(user.value.uid),
})

const workoutFilters: StateFilter<Workout> = databaseState => ({
    'owner': (owners?: string[]) => (workout) => owners?.includes(workout.value.uid)
})

/**
 * Selectors to expose to the caller:
 */
interface Selectors<T extends Filterable> {
    /**
     * Return an array containing the requested data
     */
    getOrdered: ParameterizedSelector<T, OrderedList<T>>
    /**
     * Return a map from key->value for the requested data
     */
    getData: ParameterizedSelector<T, Data<T>>
    /**
     * Find the entry with the given id, if it exists
     */
    getOne: (id: string) => Optional<T>
}

const buildSelectors = <T extends Filterable>(state: DatabaseState, model: Optional<OrderedList<T>>, filters: StateFilter<T>): Selectors<T> => {
    const getOrdered = getFilterable(model, filters(state))
    const getData = toData(getOrdered)
    const getOne = (id: string) => getData()?.[id]
    return {
        getOrdered,
        getData,
        getOne
    }
}

class DatabaseState {
    #state = {
        gyms: withDefault(() => useAppSelector(state => state.firebase.ordered.gyms), defaultGym),
        routes: withDefault(() => useAppSelector(state => state.firebase.ordered.routes), defaultRoute),
        sessions: withDefault(() => useAppSelector(state => state.firebase.ordered.sessions), defaultSession),
        users: withDefault(() => useAppSelector(state => state.firebase.ordered.users), defaultUser),
        workouts: withDefault(() => useAppSelector(state => state.firebase.ordered.workouts), defaultWorkout),
    }
    gyms = {
        ...buildSelectors(this, this.#state.gyms, gymFilters),
        // Utility function: a user can edit a gym if the owner's friends list contains the user
        canEdit: (gym: Optional<Gym>) => this.users.isFriendOf(gym?.owner)
    }
    routes = {
        ...buildSelectors(this, this.#state.routes, routeFilters),
    }
    sessions = {
        ...buildSelectors(this, this.#state.sessions, sessionFilters),
    }
    users = {
        ...buildSelectors(this, this.#state.users, userFilters),
        // Look up by UID instead of db key
        getOne: (uid: string) => {
            const users = this.users.getOrdered(['uid', uid])
            if (users === undefined) {
                return undefined
            }
            if (users.length === 0) {
                return defaultUser({uid})
            }
            return getFirst(users)?.value
        },
        // Utility function: given a list of friendUids, returns a function that evaluates if a user is on any of those friendUids' friend lists
        isFriendOf: normalizeFilterValue((friendUids: Optional<string[]>): FilterPredicate<string> => {
            const users = this.users.getOrdered(['uid', friendUids])

            if (!isLoaded(users) || !isLoaded(friendUids)) return () => undefined

            return (uid: string) => users.some(u => u.value.friends.includes(uid) || friendUids.includes(uid))
        }),
        // Utility function: given a list of friendUids, returns a function that evaluates if a user's friend list has any of those friendUids
        hasFriend: normalizeFilterValue((friendUids: Optional<string[]>): FilterPredicate<string> => (uid: string) => {
            const user = this.users.getOne(uid)

            if (!isLoaded(user) || !isLoaded(friendUids)) return undefined

            return friendUids.includes(uid) || friendUids.some(friend => user.friends.includes(friend))
        })
    }
    workouts = {
        ...buildSelectors(this, this.#state.workouts, workoutFilters)
    }

    constructor() {
        useFirebaseConnect([
            'gyms',
            'routes',
            'sessions',
            'users',
            'workouts',
        ])
    }
}

export const useDatabase = () => new DatabaseState()
