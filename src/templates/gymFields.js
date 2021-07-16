import { ALL_STYLES, printType } from '../helpers/gradeUtils';

export const gymFields = [
    {
        title: 'Gym Name',
        placeholder: 'Name..',
        name: 'name'
    },
    {
        title: 'Gym Location',
        placeholder: 'Location..',
        name: 'location',
        options: {
            type: 'text'
        }
    },
    ...ALL_STYLES.map(style => {
        return {
            title: `Wall height (${printType(style)})` ,
            placeholder: 'Height..',
            name: `${style}_HEIGHT`,
            options: {
                type: 'number'
            }
        }
    })
]