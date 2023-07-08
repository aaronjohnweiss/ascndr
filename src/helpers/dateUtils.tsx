import moment, {duration} from 'moment';

export const dateString = (date: number | string | Date) => {
    const localDate = new Date(date);
    // The ISO String method prints the date in UTC; shift the time so that it ends up showing the local date
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toISOString().split('T')[0];
}

export const localDateTimeString = (date: number | string | Date) => moment(date).format('YYYY-MM-DDTHH:mm:ss');

export const timeFromNow = (date: number | string | Date) => moment(date).fromNow();


const MAX_RELATIVE_DATE = duration(1, 'month')
export const preciseTimeFromNow = (date: number | string | Date) => {
    const age = duration(moment().diff(moment(date)))

    if (age.asMilliseconds() > MAX_RELATIVE_DATE.asMilliseconds()) {
        return moment(date).format('MMM Do YYYY')
    }

    return timeFromNow(date)
}