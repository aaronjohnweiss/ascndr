import { Data, OrderedList, Persisted } from '../../types/Firebase'
import { Gym } from '../../types/Gym'
import { Route } from '../../types/Route'
import { Session } from '../../types/Session'
import { User } from '../../types/User'
import { Workout } from '../../types/Workout'
import { DatabaseState } from './selectors'
import { Goal } from '../../types/Goal'

export type Optional<T> = T | undefined
/**
 * Predicate that can evaluate to true or false, but also return undefined to indicate that data is still loading
 */
export type FilterPredicate<T> = (t: T) => Optional<boolean>
/**
 * Function that takes filter arguments and returns a FilterPredicate
 */
type FilterFunction<T> = (values: Optional<string[]>) => FilterPredicate<T>
/**
 * Object that can be filtered upon; should define a constant _type for disambiguation
 */
export type Filterable = Gym | Route | Session | User | Workout | Goal

/**
 * All filters that can be provided for each type
 */
const FilterableFields = {
  gym: ['owner', 'editor', 'viewer', 'gymKey'],
  route: ['gym', 'session', 'viewer'],
  session: ['gym', 'owner', 'viewer', 'route', 'sessionKey'],
  user: ['uid', 'friendOf'],
  workout: ['owner', 'viewer'],
  goal: ['owner', 'viewer'],
} as const
/**
 * All applicable filters for a given Filterable type
 */
type FilterName<T extends Filterable> = (typeof FilterableFields)[T['_type']][number]
/**
 * A Filter defines FilterFunctions for every FilterName for a given Filterable type
 * (essentially, an implementation of all possible filters on a given type)
 */
export type Filter<T extends Filterable> = Record<FilterName<T>, FilterFunction<Persisted<T>>>
/**
 * A StateFilter wraps a filter in a closure that has access to the database state
 */
export type StateFilter<T extends Filterable> = (databaseState: DatabaseState) => Filter<T>
/**
 * Caller-supplied filter value
 */
export type FilterValue = Optional<string | string[]>
/**
 * Caller-supplied filter parameter (filter name and value)
 */
export type FilterParam<T extends Filterable> = [FilterName<T>, FilterValue]
/**
 * Function that will take in filter parameters and return the relevant data
 */
export type ParameterizedSelector<
  Whole extends Filterable,
  WrappedData extends OrderedList<Whole> | Data<Whole>,
> = (...params: FilterParam<Whole>[]) => Optional<WrappedData>

/**
 * Selectors to expose to the caller
 */
export interface Selectors<T extends Filterable> {
  /**
   * Return an array containing the requested data
   */
  getOrdered: ParameterizedSelector<T, OrderedList<T>>
  /**
   * Return a map from key->value for the requested data
   */
  getData: ParameterizedSelector<T, Data<T>>
  /**
   * Find the entry with the given id, if it exists
   */
  getOne: (id: string) => Optional<T>
}
