import ConfirmCancelButton from "../components/ConfirmCancelButton";
import EntityModal from "../components/EntityModal";
import {migrateGymFields} from "../templates/gymFields";
import React, {useState} from "react";
import {useModalState} from "../helpers/useModalState";
import {firebaseConnect, isLoaded} from "react-redux-firebase";
import {getEditGymsForUser, getRoutesForGym, getSessionsForGym} from "../helpers/filterUtils";
import {compose} from "redux";
import {connect} from "react-redux";
import {Form} from "react-bootstrap";


export const DeleteGymModal = ({auth: {uid}, gymId, gyms, sessions, routes, users, firebase, history}) => {
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

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
        gyms: state.firebase.ordered.gyms,
        routes: state.firebase.ordered.routes,
        sessions: state.firebase.ordered.sessions,
        users: state.firebase.ordered.users,
    }
}

export default compose(
    firebaseConnect([
        {path: 'gyms'},
        {path: 'routes'},
        {path: 'sessions'},
        {path: 'users'},
    ]),
    connect(mapStateToProps)
)(DeleteGymModal)
