import { Grade } from './Grade'
import { TOP_ROPE } from '../helpers/gradeUtils'

export interface RouteVideo {
  uid: string
  url: string
  date: number
}

export interface Route {
  _type: 'route'
  color?: string
  description?: string
  grade: Grade
  gymId: string
  isRetired: boolean
  name: string
  setter?: string
  picture?: string
  videos?: RouteVideo[]
}

export type FirebaseRoute = Pick<Route, 'gymId'> & Partial<Route>

export const defaultRoute = (part: FirebaseRoute): Route => ({
  _type: 'route',
  grade: {
    difficulty: 0,
    style: TOP_ROPE,
  },
  isRetired: false,
  name: 'Unnamed',
  ...part,
})
