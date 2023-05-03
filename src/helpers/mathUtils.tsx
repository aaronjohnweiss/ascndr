export const sum = (a, b) => a + b;

export const percentile = (arr, p) => {
    if (arr.length === 0) return 0;

    if (p <= 0) return arr[0];
    if (p >= 1) return arr[arr.length - 1];

    const index = (arr.length - 1) * p;
    const lower = Math.floor(index);
    const upper = lower + 1;
    const distance = index - lower;

    if (upper >= arr.length) return arr[lower];
    return arr[lower] * (1 - distance) + arr[upper] * (distance);
}

export const max = (x, y) => x > y ? x : y

export const sumByKey = (o1, o2) => [...new Set([...Object.keys(o1), ...Object.keys(o2)])].reduce((acc, key) => ({...acc, [key]: (o1[key] || 0) + (o2[key] || 0)}), {})

export const pluralize = (str, count, plural = `${str}s`) => count == 1 ? str : plural