const moment = require('moment-timezone');

const timeZoneName = 'Asia/Taipei';

module.exports = {
    oneSecond: 1,
    oneMinute: 1 * 60,
    oneHour: 1 * 60 * 60,
    oneDay: 1 * 60 * 60 * 24,
    oneMonth: 1 * 60 * 60 * 24 * 30,
    timeZone: '+08:00',
    apiDomain: 'https://vet-platform-server.azurewebsites.net',

    nowTime: () => Math.floor(Date.now() / 1000),

    /** 將時間戳轉成UTC+8的時間格式 */
    formatTime: (time) => moment.tz(moment.unix(time), timeZoneName).toISOString(),

    parseJson: (data) => {
        try {
            const json = JSON.parse(data);
            return json;
        } catch(error) {
            return null;
        }
    }
};