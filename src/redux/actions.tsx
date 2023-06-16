import {authRef, provider} from '../config/firebase'
import {Dispatch} from "redux";
import firebase from "firebase/app";
import SignIn from "../components/SignIn";

export const FETCH_USER = 'FETCH_USER'

export interface UserAction {
    type: typeof FETCH_USER
    payload: firebase.User | null

}

export const fetchUser = (dispatch: Dispatch<UserAction>) => {
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
export type FetchUser = typeof fetchUser

export const signIn = () => {
    authRef
        .signInWithPopup(provider)
        .then(() => {
            // no-op
        })
        .catch(error => {
            console.log(error);
        });
};

export type SignIn = typeof SignIn

export const signOut = () => {
    authRef
        .signOut()
        .then(() => {
            // Sign-out successful.
        })
        .catch(error => {
            console.log(error);
        });
};

export type SignOut = typeof signOut