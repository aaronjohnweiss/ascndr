import * as firebase from "firebase";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {FirebaseConfig} from "../config/keys";

firebase.initializeApp(FirebaseConfig);

// const databaseRef = firebase.database().ref();
// export const todosRef = databaseRef.child("todos");
export const authRef = firebase.auth();
export const provider = new firebase.auth.GoogleAuthProvider();