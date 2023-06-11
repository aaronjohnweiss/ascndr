import {defaultUser, User} from "../types/User";
import {Data} from "../types/Firebase";

const resolveUsers = (users: Data<User>, uids: string[]) => {
    let foundUsers: User[] = [];

    for (const uid of uids) {
        const user = Object.values(users).find(user => uid === user.uid);
        if (user) {
            foundUsers = foundUsers.concat(user)
        } else {
            foundUsers = foundUsers.concat(defaultUser(uid));
        }
    }

    return foundUsers;
}

export default resolveUsers