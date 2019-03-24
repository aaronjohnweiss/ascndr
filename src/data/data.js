const groups = [
    { id: 100, name: 'Test group', users: [process.env.REACT_APP_UID] }
]

const gyms = [
    { id: 100, groupId: 100, name: 'Gravity Vault', location: 'Flemington, NJ', height: 35 },
    { id: 101, groupId: 100, name: 'Rockville', location: 'Hamilton, NJ', height: 30 },
    { id: 102, groupId: 100, name: 'Garden State Rocks', location: 'Morganville, NJ', height: 28 }
]

const routes = [
    {
        id: 100,
        gymId: 101,
        name: 'Jamwise Camgee',
        description: 'Fun problem on the slab',
        grade: '5.10',
        color: 'Pink',
        picture: 'https://drive.google.com/uc?export=view&id=1sh2GVAumt2fzkLT-mV-Rei8zn3e4qv6g'
    }
]

const sessions = [
    {
        id: 100,
        gymId: 101,
        startTime: new Date(Date.now() - 5000000),
        endTime: new Date(),
        customRoutes: {
            100: 2
        },
        standardRoutes: {

        },
        notes: 'I did a good job.'
    }
]

export { groups, gyms, routes, sessions }