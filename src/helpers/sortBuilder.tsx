type SortFn<T> = (a: T, b: T) => number

interface SortBy<T> {
  ascending: SortFn<T>
  descending: SortFn<T>
}

export const contramap =
  <T, K>(f: (t: T) => K, compareFn: SortFn<K> = (a: any, b: any) => a - b): SortFn<T> =>
  (a2, b2) =>
    compareFn(f(a2), f(b2))

export const sortBy =
  <T,>() =>
  <K extends keyof T>(
    field: K,
    compareFn: SortFn<T[K]> = (a: any, b: any) => a - b
  ): SortBy<T> => ({
    ascending: contramap(x => x[field], compareFn),
    descending: contramap(
      x => x[field],
      (a, b) => compareFn(a, b) * -1
    ),
  })

export const buildSort =
  <T,>(...sorts: SortFn<T>[]): SortFn<T> =>
  (a, b) => {
    for (const sort of sorts) {
      const sortResult = sort(a, b)
      if (sortResult !== 0) return sortResult
    }
    return 0
  }
