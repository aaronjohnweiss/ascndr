import {WORKOUT_CATEGORIES} from "../helpers/workouts";

export type WorkoutCategory = typeof WORKOUT_CATEGORIES[number]

export interface Workout {
    categories: WorkoutCategory[]
    intensity: number
    startTime: number
    uid: string
}