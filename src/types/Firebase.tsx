export type Persisted<T> = {key: string, value: T}
export type OrderedList<T> = Persisted<T>[]
export type Data<T> = Record<string, T>