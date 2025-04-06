import { Goal, GoalCategory, isSessionGoal, isWorkout } from '../types/Goal'
import { pluralize } from './mathUtils'
import { DatabaseState } from '../redux/selectors/selectors'
import moment from 'moment'
import { routeCountForSession } from '../components/StatsIndex'
import { ALL_STYLES } from '../types/Grade'

export const prettyPrintGoalCategory = (category: GoalCategory) => {
  switch (category) {
    case 'ACTIVITY_COUNT':
      return 'Activity Count'
    case 'WORKOUT_COUNT':
      return 'Workout Count'
    case 'SESSION_COUNT':
      return 'Session Count'
    case 'ROUTE_COUNT':
      return 'Route Count'
    case 'ROUTE_DISTANCE':
      return 'Distance climbed'
  }
}

export const getName = (goal: Goal): string => {
  if (isWorkout(goal) && goal.workoutCategories?.length === 1) {
    return `${goal.workoutCategories[0]} workouts`
  }
  return prettyPrintGoalCategory(goal.category)
}

export const getUnits = (goal: Pick<Goal, 'category' | 'target'>): string => {
  switch (goal.category) {
    case 'ACTIVITY_COUNT':
      return pluralize('activity', goal.target, 'activities')
    case 'WORKOUT_COUNT':
      return pluralize('workout', goal.target)
    case 'SESSION_COUNT':
      return pluralize('session', goal.target)
    case 'ROUTE_COUNT':
      return pluralize('route', goal.target)
    case 'ROUTE_DISTANCE':
      return 'ft'
  }
}

export const getTargetString = (goal: Goal): string => `${goal.target} ${getUnits(goal)}`

export const getGoalProgress = (goal: Goal, uid: string, firebaseState: DatabaseState): number => {
  if (isWorkout(goal)) {
    const workouts = firebaseState.workouts.getOrdered(['owner', uid]) || []
    return workouts
      .filter(w => w.value.startTime >= goal.startTime && w.value.startTime <= goal.endTime)
      .filter(w =>
        goal.workoutCategories
          ? w.value.categories.some(category => goal.workoutCategories?.includes(category))
          : true,
      )
      .filter(w => w.value.intensity >= goal.minIntensity).length
  }

  if (isSessionGoal(goal)) {
    const sessions = firebaseState.sessions.getOrdered(['owner', uid]) || []

    return sessions
      .filter(
        s =>
          s.value.startTime >= goal.startTime && s.value.endTime && s.value.endTime <= goal.endTime,
      )
      .filter(
        s =>
          moment(s.value.endTime).diff(moment(s.value.startTime), 'minutes', true) >
          goal.minDurationMinutes,
      )
      .filter(
        s =>
          routeCountForSession(
            s.value,
            firebaseState.routes.getData() || {},
            [...ALL_STYLES],
            true,
          ) >= goal.minRouteCount,
      ).length
  }

  // TODO implement for other goal types; externalize filters to another method?

  return 0
}

export const getGoalProgressString = (goal: Goal, progress: number): string =>
  `${progress} ${getUnits(goal)}`
