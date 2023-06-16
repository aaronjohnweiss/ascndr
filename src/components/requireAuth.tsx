import React, {FC} from "react";
import {RouteComponentProps, useHistory} from "react-router";
import {useAppSelector} from "../redux";

export default function(ComposedComponent: FC<RouteComponentProps<any>>) {

    const Authentication = (props: any) => {
        const auth = useAppSelector(state => state.auth)
        const history = useHistory()

        if (auth === null || auth === false) {
            history.push("/login");
            return <></>
        }
        return <ComposedComponent {...props} />;
    }

    return Authentication
}