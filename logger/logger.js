const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format

const logFormat = printf(info => {
    return `${info.timestamp} [${info.level}] ${info.message}`
})

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        logFormat
    )
});

let date;

function getDate() {
    return new Date().toLocaleDateString().replaceAll('/', '');
}

// 自動更換log檔日期
function checkDate() {
    const currentDate = getDate();
    if (!date || currentDate > date) {
        date = currentDate;

        logger.configure({
            transports: [
                new transports.Console(),
                new transports.File({ filename: `log/info/${date}.log` }),
                new transports.File({ filename: `log/error/${date}.log`, level: 'error' })
            ]
        });
    }
}

function info(message) {
    checkDate();
    logger.info(message);
}

function error(message) {
    checkDate();
    logger.error(message);
}

module.exports = { info, error }