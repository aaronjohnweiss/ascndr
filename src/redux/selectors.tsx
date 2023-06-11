import {useAppSelector} from "./index";

export const getUser = (): firebase.User => {
    const auth = useAppSelector(state => state.auth)
    if (!auth) {
        throw new Error("uh oh")
    }
    return auth
}