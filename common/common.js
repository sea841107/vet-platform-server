module.exports = {
    oneSecond: 1,
    oneMinute: 1 * 60,
    oneHour: 1 * 60 * 60,
    oneDay: 1 * 60 * 60 * 24,
    oneMonth: 1 * 60 * 60 * 60 * 24 * 30,
    timeZone: '+08:00',
    nowTime: () => Math.floor(Date.now() / 1000)
};