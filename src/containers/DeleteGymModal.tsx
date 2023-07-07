import ConfirmCancelButton from "../components/ConfirmCancelButton";
import EntityModal from "../components/EntityModal";
import {migrateGymFields} from "../templates/gymFields";
import React, {useState} from "react";
import {useModalState} from "../helpers/useModalState";
import {isLoaded, useFirebase} from "react-redux-firebase";
import {Form} from "react-bootstrap";
import {getUser, useDatabase} from "../redux/selectors/selectors";


export const DeleteGymModal = ({gymId, history}) => {
    const { uid } = getUser()
    const firebaseState = useDatabase()
    const gyms = firebaseState.gyms.getOrdered(['editor', uid])
    const routes = firebaseState.routes.getOrdered(['gym', gymId])
    const sessions = firebaseState.sessions.getOrdered(['gym', gymId])

    const firebase = useFirebase()


    const [showMigrateModal, openMigrateModal, closeMigrateModal] = useModalState(false)
    const [shouldMigrate, setShouldMigrate] = useState(true)

    if (!isLoaded(gyms) || !isLoaded(sessions) || !isLoaded(routes)) return null;

    const handleMigrateGym = ({gymId: migratedId}) => {
        const updates = {}
        for (const route of routes) {
            updates[`/routes/${route.key}`] = {...route.value, gymId: migratedId}
        }

        for (const session of sessions) {
            updates[`/sessions/${session.key}`] = {...session.value, gymId: migratedId}
        }

        updates[`/gyms/${gymId}`] = null
        firebase.ref().update(updates)
        closeMigrateModal()
        history.push(`/gyms/${migratedId}`)
    }

    const handleDeletedGym = () => {
        const updates = {}
        for (const route of routes) {
            updates[`/routes/${route.key}`] = null
        }

        for (const session of sessions) {
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
                         fields={migrateGymFields({gyms: gyms.filter(gym => gym.key !== gymId)})}
                         title='Migrate gym'/>
        </>
    )
}

export default DeleteGymModal
