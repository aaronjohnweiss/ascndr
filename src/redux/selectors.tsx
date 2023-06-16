import {useAppSelector} from "./index";
import {defaultGym} from "../types/Gym";
import {defaultRoute} from "../types/Route";
import {defaultSession} from "../types/Session";
import {defaultUser} from "../types/User";
import {defaultWorkout} from "../types/Workout";
import {Data, OrderedList} from "../types/Firebase";

export const getUser = (): firebase.User => {
    const auth = useAppSelector(state => state.auth)
    if (!auth) {
        throw new Error("uh oh")
    }
    return auth
}

export const firebaseState = {
    gyms: {
        getData: () => fillData(useAppSelector(state => state.firebase.data.gyms), defaultGym),
        getOrdered: () => fillOrdered(useAppSelector(state => state.firebase.ordered.gyms), defaultGym),
        getOne: (id: string) => fillOne(useAppSelector(state => state.firebase.data?.gyms?.[id]), defaultGym)
    },
    routes: {
        getData: () => fillData(useAppSelector(state => state.firebase.data.routes), defaultRoute),
        getOrdered: () => fillOrdered(useAppSelector(state => state.firebase.ordered.routes), defaultRoute),
        getOne: (id: string) => fillOne(useAppSelector(state => state.firebase.data?.routes?.[id]), defaultRoute)
    },
    sessions: {
        getData: () => fillData(useAppSelector(state => state.firebase.data.sessions), defaultSession),
        getOrdered: () => fillOrdered(useAppSelector(state => state.firebase.ordered.sessions), defaultSession),
        getOne: (id: string) => fillOne(useAppSelector(state => state.firebase.data?.sessions?.[id]), defaultSession)
    },
    users: {
        getData: () => fillData(useAppSelector(state => state.firebase.data.users), defaultUser),
        getOrdered: () => fillOrdered(useAppSelector(state => state.firebase.ordered.users), defaultUser),
    },
    workouts: {
        getData: () => fillData(useAppSelector(state => state.firebase.data.workouts), defaultWorkout),
        getOrdered: () => fillOrdered(useAppSelector(state => state.firebase.ordered.workouts), defaultWorkout),
    },
}

const fillOrdered = <Part,Whole>(ordered: OrderedList<Part> | undefined, converter: (part: Part) => Whole): OrderedList<Whole> | undefined => {
    return ordered && ordered.map(persisted => ({...persisted, value: converter(persisted.value)}))
}

const fillData = <Part,Whole>(data: Data<Part> | undefined, converter: (part: Part) => Whole): Data<Whole> | undefined => {
    return data && Object.fromEntries(Object.entries(data).map(([key, part]) => [key, converter(part)] as const))
}

const fillOne = <Part,Whole>(item: Part | undefined, converter: (part: Part) => Whole): Whole | undefined => {
    return item && converter(item)
}