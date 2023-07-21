import { Location } from 'history'

export const getQuery = (location: Location<unknown>): URLSearchParams =>
  new URLSearchParams(location.search)

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const getOrDefault = <T,>(
  query: URLSearchParams,
  name: string,
  f: (s: string) => T,
  valueIfMissing: T
) => (query.has(name) ? f(query.get(name)!) : valueIfMissing)

export const getBooleanFromQuery = (query: URLSearchParams, name: string, valueIfMissing = false) =>
  getOrDefault(query, name, val => val === 'true', valueIfMissing)
export const getNumberFromQuery = (query: URLSearchParams, name: string, valueIfMissing = 0) =>
  getOrDefault(
    query,
    name,
    val => {
      const num = Number(val)
      if (isNaN(num)) return valueIfMissing
      return num
    },
    valueIfMissing
  )
