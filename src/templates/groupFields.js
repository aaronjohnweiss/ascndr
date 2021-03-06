import HiatusModel from '../components/HiatusModal';

export const groupFields = [
    {
        title: 'Group Name',
        placeholder: 'Name..',
        name: 'name'
    }
]

export const updateGroupFields = [
    {
        title: 'User ID',
        placeholder: 'UID..',
        name: 'uid'
    }
]

export const userFields = [
    {
        title: 'User Name',
        placeholder: 'Name..',
        name: 'name'
    },
    {
        title: 'Hiatuses',
        name: 'hiatuses',
        options: {
            type: 'custom',
            component: HiatusModel
        }
    }
]