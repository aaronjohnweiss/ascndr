
export function addGym(gym) {
    const action = {
        type: 'ADD_GYM',
        gym
    }
    return action
}