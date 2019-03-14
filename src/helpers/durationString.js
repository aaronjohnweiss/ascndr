const durationString = (session) => {
    const duration = new Date(session.endTime - session.startTime)

    const utcHours = duration.getUTCHours()
    const hoursString = utcHours + ' hour' + (utcHours === 1 ?  '' : 's')
    const utcMinutes = duration.getUTCMinutes()
    const minutesString = utcMinutes + ' minute' + (utcMinutes === 1 ?  '' : 's')
    return hoursString + ' ' + minutesString
}

export default durationString