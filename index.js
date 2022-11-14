const express = require('express');
const Config = require('./common/config');
const Logger = require('./logger/logger');
const Api = require('./api/api');

const port = normalizePort(process.env.PORT || Config.Server.Port);
const app = express();
app.use(express.json());
app.listen(port, () => {
    Logger.info(`Api Server Start at ${port}`);
});
Api.init(app);

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}