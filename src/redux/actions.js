import { authRef, provider } from "../config/firebase";

export const FETCH_USER = 'FETCH_USER'
export const ADD_GYM = 'ADD_GYM'
export const ADD_ROUTE = 'ADD_ROUTE'
export const ADD_SESSION = 'ADD_SESSION'

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