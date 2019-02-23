export const ADD_GYM = 'ADD_GYM'

let gymId = 0

export function addGym(gym) {
    return {
        type: ADD_GYM,
        gym: {
            ...gym,
            id: gymId++
        }
    }
}