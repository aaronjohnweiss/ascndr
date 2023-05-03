export const durationString = (durationMillis, includeMinutes = true) => {
    const hours = Math.floor(durationMillis / 3600000);
    const hoursString = hours + ' hour' + (hours === 1 ?  '' : 's');

    if (includeMinutes) {
        const minutes = Math.floor((durationMillis % 3600000) / 60000);
        const minutesString = minutes + ' minute' + (minutes === 1 ? '' : 's');
        return hoursString + ' ' + minutesString
    } else {
        return hoursString;
    }
};

export const sessionDuration = (session) => durationString(session.endTime - session.startTime);