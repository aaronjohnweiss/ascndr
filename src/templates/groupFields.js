import HiatusModel from '../components/HiatusModal';
import {isEmpty} from "react-redux-firebase";

export const groupFields = [
    {
        title: 'Group Name',
        placeholder: 'Name..',
        name: 'name'
    }
]

export const updateGroupFields = [
    {
        title: 'User ID or Name',
        placeholder: 'User...',
        name: 'userValue'
    }
]

export const userIdValidation = (users) => ({userValue}) => [
    {
        isValid: users.map(user => user.value).map(({uid, name}) => ([uid, name])).flat().filter(val => !!val).includes(userValue),
        message: 'There is no user with that UID or name',
        field: 'userValue'
    }
]

export const userNameField = [
    {
        title: 'User Name',
        placeholder: 'Name..',
        name: 'name'
    }
]

const getTakenUserNames = (users, currentUserName) => isEmpty(users) ? [] : users
    .map(user => user.value.name)
    .filter(name => !!name)
    .filter(name => name !== currentUserName)

export const userNameValidation = (users, currentUserName) => ({name}) => [
    {
        isValid: !getTakenUserNames(users, currentUserName).includes(name),
        message: `The name ${name} is already taken`,
        field: 'name',
    },
    {
        isValid: name && name.length > 0,
        message: 'Name can not be blank',
        field: 'name',
    }
]

export const userFields = [
    ...userNameField,
    {
        title: 'Hiatuses',
        name: 'hiatuses',
        options: {
            type: 'custom',
            component: HiatusModel
        }
    }
]
