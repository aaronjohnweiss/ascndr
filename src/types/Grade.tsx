import {ALL_MODIFIERS, ALL_STYLES} from "../helpers/gradeUtils";

export type RouteStyle = typeof ALL_STYLES[number]
export type RouteModifier = typeof ALL_MODIFIERS[number]

export interface Grade {
    difficulty: number
    style: RouteStyle
    modifier?: RouteModifier
}