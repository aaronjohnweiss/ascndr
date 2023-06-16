import moment from 'moment';

export const dateString = (date: number | string | Date) => {
    const localDate = new Date(date);
    // The ISO String method prints the date in UTC; shift the time so that it ends up showing the local date
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toISOString().split('T')[0];
}

export const localDateTimeString = (date: number | string | Date) => moment(date).format('YYYY-MM-DDTHH:mm:ss');

export const timeFromNow = (date: number | string | Date) => moment(date).fromNow();