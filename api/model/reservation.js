const Status = require('../../common/status');
const Api = require('../api');
const MySql = require('../../mysql/mysql');

class Reservation extends Api {
    constructor(app) {
        super();
    }
}

module.exports = Reservation