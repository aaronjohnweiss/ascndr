import { Goal, GoalCategory } from '../types/Goal'
import { pluralize } from './mathUtils'

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

export const getName = (goal: Goal): string => prettyPrintGoalCategory(goal.category)

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
