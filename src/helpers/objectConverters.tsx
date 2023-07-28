import { Data, OrderedList } from '../types/Firebase'

export const toObj = (array, keyName = 'key') => {
  if (!Array.isArray(array)) return array
  return array.reduce((obj, entry) => ({ ...obj, [entry[keyName]]: entry.value }), {})
}

export const toArray = <T,>(obj: Data<T>): OrderedList<T> => {
  return Object.entries(obj).map(([key, value]) => ({ key, value }))
}
