const Status = require('../../common/status');
const Api = require('../api');
const MySql = require('../../mysql/mysql');

class Doctor extends Api.ApiModel {
    constructor(app) {
        super();
    }
}

module.exports = Doctor