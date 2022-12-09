const Status = require('../../common/status');
const Api = require('../api');
const MySql = require('../../mysql/mysql');

class Clinic extends Api.ApiModel {
    #statusClose = 0
    #statusOpen = 1

    constructor(app) {
        super();
        this.registerApi(app, 'post', '/clinic/search', this.#search.bind(this));
        this.registerApi(app, 'post', '/clinic/getForm', this.#getForm.bind(this));
        this.registerApi(app, 'post', '/clinic/addFormTime', this.#addFormTime.bind(this));
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
            return this.send(req, res, { status: Status.Clinic_Search_Fail });
        }

        const dataList = [];
        rows.forEach(row => {
            const data = {
                id: row['id'],
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

    /** 獲取門診表 */
    async #getForm(req, res) {
        const status = this.#getFormCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }

        let sql = `SELECT *, DATE_FORMAT(date, '%Y-%m-%d') date from clinic_form c
                LEFT JOIN doctor d ON c.clinic_id = d.clinic_id AND c.doctor_id = d.id
                WHERE c.clinic_id = ${req.body.clinicId}`;

        // 城市
        if (req.body.doctorId) {
            sql += ` AND doctor_id = ${req.body.doctorId}`;
        }

        // 開始、結束日期
        sql += ` AND date >= '${req.body.startDate}' AND date <= '${req.body.endDate}'`;

        const rows = await MySql.query(sql);
        if (!rows) {
            return this.send(req, res, { status: Status.Clinic_GetForm_Fail });
        }

        let dataObj = {};
        rows.forEach(row => {
            if (!dataObj.hasOwnProperty(row['date'])) {
                dataObj[row['date']] = {
                    'morning': [],
                    'afternoon': [],
                    'evening': [],
                };
            }

            const data = {
                id: row['doctor_id'],
                name: row['name'],
                startTime: row['start_time'],
                endTime: row['end_time'],
            }
            dataObj[row['date']][row['period']].push(data);
        });

        // 排序時間
        dataObj = Object.keys(dataObj).sort().reduce((accumulator, key) => {
            accumulator[key] = dataObj[key];
            return accumulator;
        }, {});

        const result = {
            status: Status.Success,
            data: dataObj
        }
        this.send(req, res, result);
    }

    /** 新增門診時間 */
    async #addFormTime(req, res) {
        const status = this.#addFormTimeCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }

        const sql = `INSERT INTO clinic_form (clinic_id, doctor_id, date, period, start_time, end_time)
                    VALUES (${req.body.clinicId}, ${req.body.doctorId}, '${req.body.date}', '${req.body.period}', '${req.body.startTime}', '${req.body.endTime}')`;
        const rows = await MySql.query(sql);
        if (!rows) {
            return this.send(req, res, { status: Status.Clinic_AddFormTime_Fail });
        }

        const result = {
            status: Status.Success
        }
        this.send(req, res, result);
    }

    #searchCheck(req) {
        return Status.Success;
    }

    #getFormCheck(req) {
        if (!req.body.hasOwnProperty('clinicId')
            || !req.body.hasOwnProperty('startDate')
            || !req.body.hasOwnProperty('endDate')) {
            return Status.Parameter_Error;
        }

        return Status.Success;
    }

    #addFormTimeCheck(req) {
        if (!req.body.hasOwnProperty('clinicId')
            || !req.body.hasOwnProperty('doctorId')
            || !req.body.hasOwnProperty('date')
            || !req.body.hasOwnProperty('period')
            || !req.body.hasOwnProperty('startTime')
            || !req.body.hasOwnProperty('endTime')) {
            return Status.Parameter_Error;
        }

        return Status.Success;
    }
}

module.exports = Clinic