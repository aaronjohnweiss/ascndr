export const toObj = (array, keyName='key') => {
    if (!Array.isArray(array)) return array;
    return array.reduce((obj, entry) => ({...obj, [entry[keyName]]: entry.value}), {});
};

export const toArray = (obj) => {
    if (Array.isArray(obj)) return obj;
    return Object.entries(obj).map(([key, value]) => ({key, value}));
};