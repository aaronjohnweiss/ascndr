import { isEmpty } from 'react-redux-firebase'
import { missingUser, User } from '../types/User'
import { OrderedList, Persisted } from '../types/Firebase'
import { Session } from '../types/Session'
import { Workout } from '../types/Workout'

export const groupBy = <T,>(arr: OrderedList<T>, field: keyof T): Record<string, OrderedList<T>> =>
  arr.reduce((acc, x) => {
    const key = `${x.value[field]}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(x)
    return acc
  }, {})
export const filterList = <T, U>(arr: OrderedList<T>, field: keyof T, value: U): OrderedList<T> =>
  isEmpty(arr)
    ? []
    : arr.filter(item => {
        let fieldArray: unknown[]
        const itemValue = item.value[field]
        if (!Array.isArray(itemValue)) {
          fieldArray = [itemValue]
        } else {
          fieldArray = itemValue
        }

        let valueArray: unknown[]
        if (!Array.isArray(value)) {
          valueArray = [value]
        } else {
          valueArray = value
        }
        return fieldArray.some(x => valueArray.includes(x))
      })

export const findEntry = <T,>(array: OrderedList<T>, key: string): Persisted<T> | undefined =>
  array.find(item => item.key === key)
export const findUser = (
  users: OrderedList<User>,
  uid: string,
  fallback: User = missingUser(uid),
) => {
  const user = isEmpty(users) ? undefined : users.find(user => user.value.uid === uid)
  return user ? user.value : fallback
}
export const findUserKey = (users: OrderedList<User>, uid: string): string | null => {
  const user = isEmpty(users) ? undefined : users.find(user => user.value.uid === uid)
  return user ? user.key : null
}

export const getUserName = (user: User): string => user.name || user.uid

export const getSessionsForUser = (
  sessions: OrderedList<Session>,
  uid: string,
): OrderedList<Session> => filterList(sessions, 'uid', uid)

export const getWorkoutsForUser = (
  workouts: OrderedList<Workout>,
  uid: string,
): OrderedList<Workout> => filterList(workouts, 'uid', uid)

export const hasRoutes = (session: Session): boolean =>
  (session.customRoutes && session.customRoutes.length > 0) ||
  (session.standardRoutes && session.standardRoutes.length > 0)

export const getLatestSession = (sessions: OrderedList<Session> = []): Persisted<Session> | null =>
  sessions.reduce(
    (prev: Persisted<Session> | null, current) =>
      prev && prev.value && prev.value.startTime > current.value.startTime ? prev : current,
    null,
  )

export const distinct = <T,>(values: T[]): T[] => [...new Set(values)]
