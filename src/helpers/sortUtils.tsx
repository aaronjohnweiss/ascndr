
type SortFn<T> = (a: T, b: T) => number
interface SortBy<T> {
    ascending: SortFn<T>
    descending: SortFn<T>
}

export const contramap = <T, K extends keyof T> (field: K, compareFn: SortFn<T[K]> = (a: any, b: any) => a - b): SortFn<T> => (a2, b2) => compareFn(a2[field], b2[field])

export const sortBy = <T,> () => <K extends keyof T> (field: K, compareFn: SortFn<T[K]> = (a: any, b: any) => a - b): SortBy<T> => ({
    ascending: contramap(field, compareFn),
    descending: contramap(field, (a, b) => compareFn(a, b) * -1)
})

