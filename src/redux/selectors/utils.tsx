import {
  Filter,
  Filterable,
  FilterParam,
  FilterPredicate,
  FilterValue,
  Optional,
  ParameterizedSelector,
  Selectors,
  StateFilter,
} from './types'
import { Data, OrderedList, Persisted } from '../../types/Firebase'
import { DatabaseState } from './selectors'

/**
 * Given an ordered list of data and an array of predicates, filter the data. Returns undefined if any predicate returns undefined; returns the filtered list otherwise.
 */
const filterOrdered = <T,>(
  ordered: Optional<OrderedList<T>>,
  predicates: FilterPredicate<Persisted<T>>[],
): Optional<OrderedList<T>> => {
  if (!ordered) return undefined
  if (predicates.length === 0) {
    return ordered
  }
  const filteredList: OrderedList<T> = []
  for (const obj of ordered) {
    const result = evaluatePredicates(obj, predicates)
    if (result === undefined) {
      return undefined
    }
    if (result) {
      filteredList.push(obj)
    }
  }

  return filteredList
}
/**
 * Evaluate all provided predicates on the given object. Returns:
 * 1. undefined if any predicate returns undefined
 * 2. false if any predicate returns false
 * 3. true otherwise
 */
const evaluatePredicates = <T,>(
  obj: Persisted<T>,
  predicates: FilterPredicate<Persisted<T>>[],
): Optional<boolean> => {
  let result = true
  for (const predicate of predicates) {
    const predicateResult = predicate(obj)
    if (predicateResult === undefined) {
      return undefined
    }
    result = predicateResult && result
  }
  return result
}
/**
 * Convert a function that returns an OrderedList to one that returns Data
 */
const toData =
  <Whole extends Filterable>(
    orderedSelector: ParameterizedSelector<Whole, OrderedList<Whole>>,
  ): ParameterizedSelector<Whole, Data<Whole>> =>
  (...params) => {
    const ordered = orderedSelector(...params)
    return (
      ordered &&
      Object.fromEntries(ordered.map(persisted => [persisted.key, persisted.value] as const))
    )
  }
/**
 * Get the 0th element, or undefined if there is no 0th element
 */
export const getFirst = <T,>(arr: Optional<T[]>): Optional<T> => (arr?.length ? arr[0] : undefined)
/**
 * Given data and a set of filters, build a function that can filter on the data based on user parameters
 */
const getFilterable =
  <T extends Filterable>(
    selector: Optional<OrderedList<T> | null>,
    filters: Filter<T>,
  ): ParameterizedSelector<T, OrderedList<T>> =>
  (...params) => {
    if (selector === null) {
      return []
    }
    const predicates = getPredicates(params, filters)
    if (predicates === undefined) {
      return undefined
    }
    return filterOrdered(selector, predicates)
  }
/**
 * Retrieve values from the given selector, and fill in default values based on the provided converter
 */
export const withDefault = <Part, Whole extends Filterable>(
  selector: () => Optional<OrderedList<Part> | null>,
  converter: (part: Part) => Whole,
): Optional<OrderedList<Whole> | null> => {
  const data = selector()
  if (data === null || data === undefined) return data

  return data.map(persisted => ({
    ...persisted,
    value: converter(persisted.value),
  }))
}
/**
 * Wrap a function that takes (string[] | undefined) into one that takes (string | string[] | undefined), for caller convenience
 */
export const normalizeFilterValue =
  <T,>(func: (x: Optional<string[]>) => T) =>
  (y: FilterValue) => {
    if (y !== undefined && !Array.isArray(y)) y = [y]
    return func(y)
  }
/**
 * Build a set of predicates that match the provided params
 */
const getPredicates = <T extends Filterable>(params: FilterParam<T>[], filters: Filter<T>) => {
  const predicates: FilterPredicate<Persisted<T>>[] = []
  // eslint-disable-next-line prefer-const
  for (let [key, value] of params) {
    const predicate = normalizeFilterValue(filters[key])(value)

    if (predicate) {
      predicates.push(predicate)
    } else {
      return undefined
    }
  }
  return predicates
}
/**
 * Build selectors (getOrdered, getData, getOne) for a given Filterable type
 */
export const buildSelectors = <T extends Filterable>(
  state: DatabaseState,
  model: Optional<OrderedList<T> | null>,
  filters: StateFilter<T>,
): Selectors<T> => {
  const getOrdered = getFilterable(model, filters(state))
  const getData = toData(getOrdered)
  const getOne = (id: string) => getData()?.[id]
  return {
    getOrdered,
    getData,
    getOne,
  }
}
