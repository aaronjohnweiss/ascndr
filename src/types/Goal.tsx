import { WorkoutCategory } from './Workout'
import { Grade, RouteStyle } from './Grade'

export const GOAL_CATEGORIES = [
  'ACTIVITY_COUNT',
  'WORKOUT_COUNT',
  'SESSION_COUNT',
  'ROUTE_COUNT',
  'ROUTE_DISTANCE',
] as const

export type GoalCategory = (typeof GOAL_CATEGORIES)[number]

export const isGoalCategory = (str: string): str is GoalCategory =>
  GOAL_CATEGORIES.some(cat => cat === str)

export type ActivityGoalDetails = {
  category: 'ACTIVITY_COUNT'
}

export type WorkoutGoalDetails = {
  category: 'WORKOUT_COUNT'
  workoutCategories: WorkoutCategory[]
  minIntensity: number
}

export type SessionGoalDetails = {
  category: 'SESSION_COUNT'
  minDurationMinutes: number
  minRouteCount: number
}

export type RouteCountGoalDetails = {
  category: 'ROUTE_COUNT'
  styles: Partial<
    Record<
      RouteStyle,
      {
        minGrade: Grade
      }
    >
  >
}

export type DistanceGoalDetails = {
  category: 'ROUTE_DISTANCE'
  styles: Record<
    RouteStyle,
    {
      minGrade: Grade
    }
  >
}

export type SharedGoal = {
  isShared: true
  participants: string[]
}

export type SoloGoal = {
  isShared: false
}

export type GoalDetails =
  | ActivityGoalDetails
  | WorkoutGoalDetails
  | SessionGoalDetails
  | RouteCountGoalDetails
  | DistanceGoalDetails

export type Goal = {
  _type: 'goal'
  category: GoalCategory
  owner: string
  startTime: number
  endTime: number
  target: number
  participants: string[]
} & (SharedGoal | SoloGoal) &
  GoalDetails

export type FirebaseGoal = Goal

export const isShared = (goal: Goal): goal is Goal & SharedGoal => goal.isShared
export const isWorkout = (goal: Goal): goal is Goal & WorkoutGoalDetails =>
  goal.category === 'WORKOUT_COUNT'
