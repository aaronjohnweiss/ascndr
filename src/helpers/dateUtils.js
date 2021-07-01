import moment from 'moment';

export const dateString = (date) => new Date(date).toISOString().split('T')[0]

export const localDateTimeString = (date) => moment(date).format('YYYY-MM-DDTHH:mm:ss');