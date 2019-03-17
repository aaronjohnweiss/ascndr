export const routeCreateFields = [
    {
        title: 'Route Name',
        placeholder: 'Name..',
        name: 'name'
    },
    {
        title: 'Description',
        placeholder: 'Description..',
        name: 'description',
        options: {
            type: 'text'
        }
    },
    {
        title: 'Route Grade',
        placeholder: 'Grade..',
        name: 'grade'
    },
    {
        title: 'Route Color',
        placeholder: 'Color..',
        name: 'color'
    },
    {
        title: 'Route Image',
        name: 'picture',
        options: {
            type: 'file',
            accept: 'image/*'
        }
    }
]

export const routeUpdateFields = [...routeCreateFields,
    {
        title: 'Retired',
        name: 'isRetired',
        options: {
            type: 'checkbox'
        }
    }
]