import { authRef, provider } from '../config/firebase'

export const FETCH_USER = 'FETCH_USER'
export const ADD_GYM = 'ADD_GYM'
export const ADD_ROUTE = 'ADD_ROUTE'
export const UPDATE_GYM = 'UPDATE_GYM'
export const ADD_SESSION = 'ADD_SESSION'
export const UPDATE_ROUTE = 'UPDATE_ROUTE'
export const UPDATE_SESSION = 'UPDATE_SESSION'

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

export function updateGym(gym) {
    return {
        type: UPDATE_GYM,
        gym: gym
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

export function updateRoute(route) {
    return {
        type: UPDATE_ROUTE,
        route: route
    }
}

let sessionId = 0

export function addSession(session) {
    return {
        type: ADD_SESSION,
        session: {
            ...session,
            id: sessionId++
        }
    }
}

export function updateSession(session) {
    return {
        type: UPDATE_SESSION,
        session
    }
}

export const fetchUser = () => dispatch => {
    authRef.onAuthStateChanged(user => {
        if (user) {
            dispatch({
                type: FETCH_USER,
                payload: user
            });
        } else {
            dispatch({
                type: FETCH_USER,
                payload: null
            });
        }
    });
};

export const signIn = () => dispatch => {
    authRef
        .signInWithPopup(provider)
        .then(result => {})
        .catch(error => {
            console.log(error);
        });
};

export const signOut = () => dispatch => {
    authRef
        .signOut()
        .then(() => {
            // Sign-out successful.
        })
        .catch(error => {
            console.log(error);
        });
};