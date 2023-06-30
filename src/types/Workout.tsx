import {WORKOUT_CATEGORIES} from "../helpers/workouts";

export type WorkoutCategory = typeof WORKOUT_CATEGORIES[number]

export interface Workout {
    _type: 'workout'
    categories: WorkoutCategory[]
    intensity: number
    startTime: number
    uid: string
}

export type FirebaseWorkout = Pick<Workout, 'uid'> & Partial<Workout>

export const defaultWorkout = (part: FirebaseWorkout): Workout => ({
    _type: 'workout',
    categories: [],
    intensity: 0,
    startTime: new Date().getTime(),
    ...part
})