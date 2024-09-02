export const TOP_ROPE = 'TOP_ROPE'
export const BOULDER = 'BOULDER'
export const LEAD = 'LEAD'
export const ALL_STYLES = [TOP_ROPE, BOULDER, LEAD] as const
export const ALL_MODIFIERS = ['-', null, '+'] as const
export const GRADE_RANGE: Record<RouteStyle, { min: number; max: number }> = {
  [TOP_ROPE]: { min: 6, max: 14 },
  [BOULDER]: { min: 0, max: 10 },
  [LEAD]: { min: 6, max: 14 },
}

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
