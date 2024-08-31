import { WorkoutCategory } from './Workout'
import { Grade, RouteStyle } from './Grade'

const GOAL_CATEGORIES = [
  'ACTIVITY_COUNT',
  'WORKOUT_COUNT',
  'SESSION_COUNT',
  'ROUTE_COUNT',
  'ROUTE_DISTANCE',
] as const

export type GOAL_CATEGORY = (typeof GOAL_CATEGORIES)[number]

export type SharedGoal = {
  isShared: true
  participants: string[]
}

export type SoloGoal = {
  isShared: false
}

export type BaseGoal = {
  _type: 'goal'
  category: GOAL_CATEGORY
  owner: string
  startTime: number
  endTime: number
  target: number
  participants: string[]
} & (SharedGoal | SoloGoal)

export type ActivityGoal = BaseGoal & {
  category: 'ACTIVITY_COUNT'
}

export type WorkoutGoal = BaseGoal & {
  category: 'WORKOUT_COUNT'
  workoutCategories: WorkoutCategory[]
  minIntensity: number
}

export type SessionGoal = BaseGoal & {
  category: 'SESSION_COUNT'
  minDuration?: number
  minRouteCount?: number
}

export type RouteCountGoal = BaseGoal & {
  category: 'ROUTE_COUNT'
  styles: Record<
    RouteStyle,
    {
      minGrade: Grade
    }
  >
}

export type DistanceGoal = BaseGoal & {
  category: 'ROUTE_DISTANCE'
  styles: Record<
    RouteStyle,
    {
      minGrade: Grade
    }
  >
}

export type Goal = ActivityGoal | WorkoutGoal | SessionGoal | RouteCountGoal | DistanceGoal

export type FirebaseGoal = Goal

export const isShared = (goal: Goal): goal is Goal & SharedGoal => goal.isShared
