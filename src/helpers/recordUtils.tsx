export const entries = <K extends number | string | symbol, V> (record: Record<K,V>): [K, V][] => {
    const arr: [K, V][] = []
    for (const k in record) {
        arr.push([k as K, record[k]])
    }
    return arr
}