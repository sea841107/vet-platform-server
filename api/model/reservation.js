const request = require('request');

const Status = require('../../common/status');
const Common = require('../../common/common');
const Api = require('../api');
const MySql = require('../../mysql/mysql');

class Reservation extends Api.ApiModel {
    #maxNumPerTime = 2 // 每個時段最大預約人數
    #timeOffset = 30 // 預約時間間隔

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

        // 時間範圍
        const startTime = Common.nowTime();
        const endTime = startTime + Common.oneMonth;
        
        const clinicForm = await this.#getClinicForm(req.body.clinicId, req.body.doctorId, startTime, endTime, req.header('Authorization'));
        if (!clinicForm) {
            return this.send(req, res, { status: Status.Reservation_GetClinicForm_Fail });
        }

        const timeForm = this.#createTimeForm(clinicForm);

        let sql = `SELECT DISTINCT(reserve_time) FROM reservation_list WHERE clinic_id = ${req.body.clinicId}`;

        // 醫生ID
        if (req.body.doctorId) {
            sql += ` AND doctor_id = '${req.body.doctorId}'`;
        }
        sql += ` AND reserve_time >= ${startTime} AND reserve_time <= ${endTime}`;

        const rows = await MySql.query(sql);
        if (!rows) {
            return this.send(req, res, { status: Status.Reservation_GetAvalibleTime_Fail });
        }

        const result = {
            status: Status.Success,
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
    async #getClinicForm(clinicId, doctorId, startTime, endTime, token) {
        const startDate = Common.formatTime(startTime).split('T')[0];
        const endDate = Common.formatTime(endTime).split('T')[0];
        let options = {
            url: Common.apiDomain + '/clinic/getForm',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                clinicId, doctorId, startDate,endDate
            }),
        };

        return await new Promise((resolve, reject) => {
            request.post(options, (error, response, body) => {
                if (error || !body) {
                    reject();
                    return;
                }

                const result = Common.parseJson(body);
                if (result['data']) {
                    resolve(result['data'])
                } else {
                    resolve();
                }
            })
        });
    }

    /** 生成時間表 */
    async #createTimeForm(form) {
        const timeForm = {};
        Object.keys(form).forEach((date) => {
            if (!timeForm.hasOwnProperty(date)) {
                timeForm[date] = {};
            }
            Object.values(form[date]).forEach((list) => {
                list.forEach(data => {
                    for (let i = parseInt(data['startTime']);; i += this.#timeOffset) {
                        const time = this.#numToTime(i);
                        if (time >= data['endTime']) {
                            break;
                        }

                        i = parseInt(time);

                        if (!timeForm[date].hasOwnProperty(time)) {
                            timeForm[date][time] = {
                                id: data['id'],
                                name: data['name']
                            }
                        }
                    }
                });
            })
        });

        return timeForm;
    }

    /** 數字轉成時間 */
    #numToTime(num) {
        let hour = Math.floor(num / 100);
        let minute = num % 100;
        if (minute >= 60) {
            hour += 1;
            minute -= 60;
        }

        let time;
        if (hour < 10) {
            time = `0${hour}`;
        } else {
            time = `${hour}`;
        }
        if (minute < 10) {
            time = `${time}0${minute}`;
        } else {
            time = `${time}${minute}`;
        }

        return time;
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