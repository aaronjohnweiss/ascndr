export const ADD_GYM = 'ADD_GYM'
export const ADD_ROUTE = 'ADD_ROUTE'

let gymId = 0

export function addGym(gym) {
    return {
        type: ADD_GYM,
        gym: {
            ...gym,
            id: gymId++
        }
    }
}

let routeId = 0

export function addRoute(route) {
    return {
        type: ADD_ROUTE,
        route: {
            ...route,
            id: routeId++
        }
    }
}