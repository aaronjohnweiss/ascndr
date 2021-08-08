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