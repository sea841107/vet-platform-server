const Status = require('../../common/status');
const Api = require('../api');
const MySql = require('../../mysql/mysql');

class Clinic extends Api.ApiModel {
    #statusClose = 0
    #statusOpen = 1

    constructor(app) {
        super();
        this.registerApi(app, 'post', '/clinic/search', this.#search.bind(this));
    }

    /** 診所搜尋 */
    async #search(req, res) {
        const status = this.#searchCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }

        const doctorSql = `SELECT GROUP_CONCAT(picture ORDER BY doctor.id ASC SEPARATOR ',') from doctor WHERE clinic.id = clinic_id`;
        let sql = `SELECT *, (${doctorSql}) as doctor_pictures FROM clinic
                WHERE status = ${this.#statusOpen}`;

        // 城市
        if (req.body.city) {
            sql += ` AND city = '${req.body.city}'`;
        }

        // 區
        if (req.body.dist) {
            sql += ` AND district = '${req.body.dist}'`;
        }

        // 種類
        if (req.body.type) {
            sql += ` AND experts like '%${req.body.type}%'`;
        }

        const rows = await MySql.query(sql);
        if (!rows) {
            return this.send(req, res, { status: Status.Search_Fail });
        }

        const dataList = [];
        rows.forEach(row => {
            const data = {
                title: row['name'],
                clinicPicture: row['picture'],
                address: row['address'],
                experts: row['experts'].split(','),
                tags: row['tags'].split(','),
                remark: row['remark'],
                doctorPictures: row['doctor_pictures'].split(',')
            }

            dataList.push(data);
        });

        const result = {
            status: Status.Success,
            data: dataList
        }
        this.send(req, res, result);
    }

    #searchCheck(req) {
        return Status.Success;
    }
}

module.exports = Clinic