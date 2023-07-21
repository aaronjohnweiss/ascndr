import { ALL_MODIFIERS, ALL_STYLES } from '../helpers/gradeUtils'

export type RouteStyle = (typeof ALL_STYLES)[number]
export type RouteModifier = (typeof ALL_MODIFIERS)[number]

export const isStyle = (str: string): str is RouteStyle =>
  ALL_STYLES.find(style => style === str) !== undefined
export interface Grade {
  difficulty: number
  style: RouteStyle
  modifier?: RouteModifier
}

export interface GradeDecoration {
  percentage?: number
}

export type DecoratedGrade = Grade & GradeDecoration

export type DecoratedCustomGrade = GradeDecoration & { key: string }
