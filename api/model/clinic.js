const Status = require('../../common/status');
const Api = require('../api');
const MySql = require('../../mysql/mysql');

class Clinic extends Api {
    constructor(app) {
        super();
        app.get('/clinic/search', this.#search.bind(this));
    }

    async #search(req, res) {
        const status = this.#searchCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }

        const result = {
            status: Status.Success,
            data: {
                title: '',
                clinicPicture: '',
                address: '',
                minPrice: '',
                maxPrice: '',
                tags: '',
                commentCount: '',
                rate: '',
                remark: '',
                doctorPictures: ''
            }
        }
        this.send(req, res, result);
    }

    #searchCheck(req) {
        if (req.body.hasOwnProperty('type')) {
            return Status.Search_Type_Invalid;
        }

        return Status.Success;
    }
}

module.exports = Clinic