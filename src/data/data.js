const gyms = [
    { id: 100, name: 'Gravity Vault', location: 'Flemington, NJ', height: 35 },
    { id: 101, name: 'Rockville', location: 'Hamilton, NJ', height: 30 },
    { id: 102, name: 'Garden State Rocks', location: 'Morganville, NJ', height: 28 }
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
        startTime: Date.now() - 5000,
        endTime: Date.now(),
        routeIds: [
            {
                id: 100,
                times: 2
            }
        ],
        notes: 'I did a good job.'
    }
]

export { gyms, routes, sessions }