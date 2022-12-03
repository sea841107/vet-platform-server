const Status = require('../../common/status');
const Common = require('../../common/common');
const Api = require('../api');
const MySql = require('../../mysql/mysql');

class Reservation extends Api.ApiModel {
    #maxNumPerTime = 2 // 每個時段最大預約人數

    constructor(app) {
        super();
        this.registerApi(app, 'post', '/reservation/getAvalibleTime', this.#getAvalibleTime.bind(this));
        this.registerApi(app, 'post', '/reservation/reserve', this.#reserve.bind(this));
    }

    /** 獲取可預約的時間 */
    async #getAvalibleTime(req, res) {
        const status = this.#getAvalibleTimeCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }
        
        const clinicForm = await this.#getClinicForm(req.body.clinicId);
        if (!clinicForm) {
            return this.send(req, res, { status: Status.Reservation_GetClinicForm_Fail });
        }

        // 時間範圍
        const startTime = Common.nowTime();
        const endTime = nowTime + Common.oneMonth ;

        let sql = `SELECT * FROM reservation_list WHERE clinic_id = ${req.body.clinicId} AND `;

        // 醫生ID
        if (req.body.doctorId) {
            sql += ` AND doctorId = '${req.body.doctorId}'`;
        }
        sql += ' GROUP BY date';

        const rows = await MySql.query(sql);
        if (!rows) {
            return this.send(req, res, { status: Status.Reservation_GetAvalibleTime_Fail });
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

    /** 預約 */
    async #reserve(req, res) {
        const status = this.#reserveCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }

        const reserveTime = Math.floor(new Date(`${req.body.reserveTime}${Common.timeZone}`).getTime() / 1000);
        const selectSql = `SELECT COUNT(*) as count FROM reservation_list WHERE clinic_id = ${req.body.clinicId}
                AND doctor_id = ${req.body.doctorId} AND reserve_time = ${reserveTime}`;

        const selectRows = await MySql.query(selectSql);
        if (!selectRows) {
            return this.send(req, res, { status: Status.Reservation_Reserve_Fail });
        }

        // 該時段預約人數已滿
        if (selectRows[0]['count'] >= this.#maxNumPerTime) {
            return this.send(req, res, { status: Status.Reservation_Reserve_Full });
        }

        const remark = req.body.remark || '';
        const addTime = Common.nowTime();
        const uniqueId = `${res.locals.user.id}${req.body.clinicId}${req.body.doctorId}${reserveTime}`;
        const insertSql = `INSERT INTO reservation_list (user_id, clinic_id, doctor_id, unique_id, reserve_time, add_time, remark)
                VALUES(${res.locals.user.id}, ${req.body.clinicId}, ${req.body.doctorId}, '${uniqueId}', ${reserveTime}, ${addTime}, '${remark}')`;

        const insertRows = await MySql.query(insertSql);
        if (!insertRows) {
            return this.send(req, res, { status: Status.Reservation_Reserve_Fail });
        }

        const result = {
            status: Status.Success,
        }
        this.send(req, res, result);
    }

    /** 獲取門診表 */
    async #getClinicForm(clinicId, doctorId) {
        let sql = `SELECT business_time from clinic_form WHERE clinic_id = ${clinicId}`;
        if (doctorId) {
            sql += ` AND doctor_id = ${doctorId}`;
        }
        const rows = await MySql.query(sql);
        if (!rows || rows.length == 0) {
            return null;
        }

        return rows;
    }

    /** 生成時間表 */
    async #createTimeForm(startTime, endTime) {
        const timeForm = {};
        
        let sql = `SELECT business_time from clinic_form WHERE clinic_id = ${clinicId}`;
        if (doctorId) {
            sql += ` AND doctor_id = ${doctorId}`;
        }
        const rows = await MySql.query(sql);
        if (!rows || rows.length == 0) {
            return null;
        }

        return rows;
    }

    #getAvalibleTimeCheck(req) {
        if (!req.body.hasOwnProperty('clinicId')) {
            return Status.Parameter_Error;
        }

        return Status.Success;
    }

    #reserveCheck(req) {
        if (!req.body.hasOwnProperty('clinicId')
        || !req.body.hasOwnProperty('doctorId')
        || !req.body.hasOwnProperty('reserveTime')) {
            return Status.Parameter_Error;
        }

        return Status.Success;
    }
}

module.exports = Reservation