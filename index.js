const express = require('express');
const fs = require('fs');
const path = require('path');
const Config = require('./common/config');
const Logger = require('./logger/logger');

const port = normalizePort(process.env.PORT || Config.Server.Port);
const app = express();
app.use(express.json());
app.listen(port, () => {
    Logger.info(`Api Server Start at ${port}`);
});
initApi(app);

function initApi(app) {
    const folder = path.join(__dirname, 'api/model')
    fs.readdirSync(folder).forEach(file => {
        const name = file.split('.')[0];
        const model = require(`./api/model/${name}`);
        new model(app);
    });
}

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