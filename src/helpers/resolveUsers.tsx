const resolveUsers = (users, uids) => {
    let foundUsers = [];

    for (const uid of uids) {
        const user = Object.values(users).find(user => uid === user.uid);
        if (user) {
            foundUsers = foundUsers.concat(user)
        } else {
            foundUsers = foundUsers.concat({uid, name: uid});
        }
    }

    return foundUsers;
}

export default resolveUsers