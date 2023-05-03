import ConfirmCancelButton from "../components/ConfirmCancelButton";
import EntityModal from "../components/EntityModal";
import {migrateGymFields} from "../templates/gymFields";
import React, {useState} from "react";
import {useModalState} from "../helpers/useModalState";
import {isLoaded, useFirebase, useFirebaseConnect} from "react-redux-firebase";
import {getEditGymsForUser, getRoutesForGym, getSessionsForGym} from "../helpers/filterUtils";
import {useSelector} from "react-redux";
import {Form} from "react-bootstrap";
import {AppState} from "../redux/reducer";


export const DeleteGymModal = ({gymId, history}) => {
    useFirebaseConnect([
        'gyms',
        'routes',
        'sessions',
        'users'
    ])

    const { uid } = useSelector((state: AppState) => state.auth)
    const gyms = useSelector((state: AppState) => state.firebase.ordered.gyms)
    const routes = useSelector((state: AppState) => state.firebase.ordered.routes)
    const sessions = useSelector((state: AppState) => state.firebase.ordered.sessions)
    const users = useSelector((state: AppState) => state.firebase.ordered.users)

    const firebase = useFirebase()


    const [showMigrateModal, openMigrateModal, closeMigrateModal] = useModalState(false)
    const [shouldMigrate, setShouldMigrate] = useState(true)

    if (!isLoaded(gyms, sessions, routes, users)) return null;

    const editableGyms = getEditGymsForUser(gyms, users, uid);
    const routesForGym = getRoutesForGym(routes, {key: gymId});
    const sessionsForGym = getSessionsForGym(sessions, {key: gymId});

    const handleMigrateGym = ({gymId: migratedId}) => {
        const updates = {}
        for (const route of routesForGym) {
            updates[`/routes/${route.key}`] = {...route.value, gymId: migratedId}
        }

        for (const session of sessionsForGym) {
            updates[`/sessions/${session.key}`] = {...session.value, gymId: migratedId}
        }

        updates[`/gyms/${gymId}`] = null
        firebase.ref().update(updates)
        closeMigrateModal()
        history.push(`/gyms/${migratedId}`)
    }

    const handleDeletedGym = () => {
        const updates = {}
        for (const route of routesForGym) {
            updates[`/routes/${route.key}`] = null
        }

        for (const session of sessionsForGym) {
            updates[`/sessions/${session.key}`] = null
        }

        updates[`/gyms/${gymId}`] = null
        firebase.ref().update(updates)
        history.push(`/gyms`)
    }

    const handleConfirmDelete = () => {
        if (shouldMigrate) {
            openMigrateModal()
        } else {
            handleDeletedGym()
        }
    }

    const deleteGymForm = <Form>
        {[
            {
                value: true,
                label: 'Migrate sessions and routes to another gym'
            },
            {
                value: false,
                label: 'Delete gym along with all sessions and routes'
            },
        ].map(({value, label}, idx) =>
            <Form.Check key={idx} id={`${value}`} type='radio'
                        checked={shouldMigrate === value}
                        onChange={() => setShouldMigrate(value)} label={label}/>
        )}
    </Form>

    return (
        <>
            <ConfirmCancelButton handleConfirm={handleConfirmDelete}
                                 modalTitle='Delete Gym?'
                                 modalBody={deleteGymForm}
                                 buttonText='Delete Gym'
                                 buttonProps={{variant: 'danger'}}
                                 buttonBlock={true}/>

            <EntityModal show={showMigrateModal}
                         handleClose={closeMigrateModal}
                         handleSubmit={handleMigrateGym}
                         fields={migrateGymFields({gyms: editableGyms.filter(gym => gym.key !== gymId)})}
                         title='Migrate gym'/>
        </>
    )
}

export default DeleteGymModal
