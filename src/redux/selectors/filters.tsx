import { FilterPredicate, Optional, StateFilter } from './types'
import { Workout } from '../../types/Workout'
import { Gym } from '../../types/Gym'
import { defaultUser, User } from '../../types/User'
import { Route } from '../../types/Route'
import { Session } from '../../types/Session'
import { isLoaded } from 'react-redux-firebase'
import { DatabaseState } from './selectors'
import { getFirst, normalizeFilterValue } from './utils'

export const gymFilters: StateFilter<Gym> = databaseState => ({
  owner: (owners?: string[]) => gym => owners?.includes(gym.value.owner),
  // An editor must be on the owner's friends list
  editor: (editors?: string[]) => gym => {
    const canEdit = databaseState.gyms.canEdit(gym.value)
    return editors?.some(canEdit)
  },
  // A viewer must have the owner on the viewer's friends list
  viewer: (viewers?: string[]) => gym => {
    const hasOwnerAsFriend = databaseState.users.hasFriend(gym.value.owner)
    return viewers?.some(hasOwnerAsFriend)
  },
  gymKey: (gymKeys?: string[]) => gym => gymKeys?.includes(gym.key),
})
export const routeFilters: StateFilter<Route> = databaseState => ({
  gym: (gymKeys?: string[]) => route => gymKeys?.includes(route.value.gymId),
  // All routes which were climbed in the given sessions
  session: (sessionKeys?: string[]) => route => {
    const sessionsForRoute = databaseState.sessions.getOrdered(
      ['sessionKey', sessionKeys],
      ['route', route.key]
    )

    if (!isLoaded(sessionsForRoute)) return undefined

    return sessionsForRoute.length > 0
  },
  viewer: (viewers?: string[]) => route => {
    const gyms = databaseState.gyms.getOrdered(['gymKey', route.value.gymId], ['viewer', viewers])

    if (!isLoaded(gyms)) return undefined
    return gyms.length > 0
  },
})
export const sessionFilters: StateFilter<Session> = databaseState => ({
  gym: (gymKeys?: string[]) => session => gymKeys?.includes(session.value.gymId),
  owner: (owners?: string[]) => session => owners?.includes(session.value.uid),
  // A viewer must have the owner on the viewer's friends list
  viewer: (viewers?: string[]) => session => {
    const hasOwnerAsFriend = databaseState.users.hasFriend(session.value.uid)
    return viewers?.some(hasOwnerAsFriend)
  },
  // All sessions in which the given routes were climbed
  route: (routeKeys?: string[]) => session =>
    routeKeys
      ? session.value.customRoutes &&
        session.value.customRoutes.some(route => routeKeys.includes(route.key))
      : undefined,
  sessionKey: (sessionKeys?: string[]) => session => sessionKeys?.includes(session.key),
})

export const canEditSession = (session: Optional<Session>) =>
  normalizeFilterValue((editors: Optional<string[]>) => session && editors?.includes(session.uid))

export const userFilters: StateFilter<User> = databaseState => ({
  uid: (uids?: string[]) => user => uids?.includes(user.value.uid),
  friendOf: uids => user => databaseState.users.isFriendOf(uids)(user.value.uid),
})

export const getUserByUid = (databaseState: DatabaseState) => (uid: string) => {
  const users = databaseState.users.getOrdered(['uid', uid])
  if (users === undefined) {
    return undefined
  }
  if (users.length === 0) {
    return defaultUser({ uid })
  }
  return getFirst(users)?.value
}

export const isFriendOf = (databaseState: DatabaseState) =>
  normalizeFilterValue((friendUids: Optional<string[]>): FilterPredicate<string> => {
    const users = databaseState.users.getOrdered(['uid', friendUids])

    if (!isLoaded(users) || !isLoaded(friendUids)) return () => undefined

    return (uid: string) =>
      users.some(u => u.value.friends.includes(uid) || friendUids.includes(uid))
  })

export const hasFriend = (databaseState: DatabaseState) =>
  normalizeFilterValue(
    (friendUids: Optional<string[]>): FilterPredicate<string> =>
      (uid: string) => {
        const user = databaseState.users.getOne(uid)

        if (!isLoaded(user) || !isLoaded(friendUids)) return undefined

        return friendUids.includes(uid) || friendUids.some(friend => user.friends.includes(friend))
      }
  )
export const workoutFilters: StateFilter<Workout> = databaseState => ({
  owner: (owners?: string[]) => workout => owners?.includes(workout.value.uid),
  viewer: (viewers?: string[]) => session => {
    const hasOwnerAsFriend = databaseState.users.hasFriend(session.value.uid)
    return viewers?.some(hasOwnerAsFriend)
  },
})
