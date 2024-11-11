import { IconType } from 'react-icons/lib'
import { FaBuilding, FaDumbbell, FaUser } from 'react-icons/fa'
import { FaChartColumn, FaGear, FaHillRockslide, FaHouse } from 'react-icons/fa6'

export type NavBarItem = {
  href: string
  text: string
  icon: IconType
  subPages?: readonly string[]
}
export const NAV_LINKS = {
  LOGIN: {
    href: '/login',
    text: 'Sign in',
    icon: FaUser,
  },
  HOME: {
    href: '/',
    text: 'Home',
    icon: FaHouse,
  },
  GYMS: {
    href: '/gyms',
    text: 'Gyms',
    icon: FaBuilding,
    subPages: ['/routes', '/sessions'],
  },
  WORKOUTS: {
    href: '/workouts',
    text: 'Workouts',
    icon: FaDumbbell,
  },
  STATS: {
    href: `/stats`,
    text: 'Stats',
    icon: FaChartColumn,
  },
  ROUTES: {
    href: '/routeGallery',
    text: 'Routes',
    icon: FaHillRockslide,
  },
  USER: {
    href: '/user',
    text: 'User Settings',
    icon: FaGear,
  },
} as const
