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
        const startDate = Common.formatTime(startTime).split('T')[0];
        const endDate = Common.formatTime(endTime).split('T')[0];
        
        const clinicForm = await this.getClinicForm(req.header('Authorization'), req.body.clinicId, req.body.doctorId, startDate, endDate);
        if (!clinicForm) {
            return this.send(req, res, { status: Status.Reservation_GetClinicForm_Fail });
        }

        const timeForm = this.#createTimeForm(clinicForm);

        let sql = `SELECT reserve_time, COUNT(reserve_time) count FROM reservation_list WHERE clinic_id = ${req.body.clinicId}`;

        // 醫生ID
        if (req.body.doctorId) {
            sql += ` AND doctor_id = ${req.body.doctorId}`;
        }
        sql += ` AND reserve_time >= '${startDate}' AND reserve_time <= '${endDate}'`;
        sql += ` GROUP BY reserve_time`;

        const rows = await MySql.query(sql);
        if (!rows) {
            return this.send(req, res, { status: Status.Reservation_GetAvalibleTime_Fail });
        }

        rows.forEach(row => {
            const splitTime = row['reserve_time'].split(' ');
            const date = splitTime[0];
            const time = splitTime[1].replace(':', '');
            if (timeForm.hasOwnProperty(date)) {
                if (timeForm[date].hasOwnProperty(time) && row['count'] >= this.#maxNumPerTime) {
                    delete timeForm[date][time];
                }
            }
        });

        const result = {
            status: Status.Success,
            data: timeForm
        }
        this.send(req, res, result);
    }

    /** 預約 */
    async #reserve(req, res) {
        const status = this.#reserveCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }

        const selectSql = `SELECT COUNT(*) as count FROM reservation_list WHERE clinic_id = ${req.body.clinicId}
                AND doctor_id = ${req.body.doctorId} AND reserve_time = '${req.body.reserveTime}'`;

        const selectRows = await MySql.query(selectSql);
        if (!selectRows) {
            return this.send(req, res, { status: Status.Reservation_Reserve_Fail });
        }

        // 該時段預約人數已滿
        if (selectRows[0]['count'] >= this.#maxNumPerTime) {
            return this.send(req, res, { status: Status.Reservation_Reserve_Full });
        }

        const remark = req.body.remark || '';
        const addTime = Common.formatTime(Common.nowTime()).split('.')[0].replace('T', ' ');
        const reserveTimestamp = Math.floor(new Date(`${req.body.reserveTime}${Common.timeZone}`).getTime() / 1000);
        const uniqueId = `${res.locals.user.id}${req.body.clinicId}${req.body.doctorId}${reserveTimestamp}`;
        const insertSql = `INSERT INTO reservation_list (user_id, clinic_id, doctor_id, unique_id, reserve_time, add_time, remark)
                VALUES(${res.locals.user.id}, ${req.body.clinicId}, ${req.body.doctorId}, '${uniqueId}', '${req.body.reserveTime}', '${addTime}', '${remark}')`;

        const insertRows = await MySql.query(insertSql);
        if (!insertRows) {
            return this.send(req, res, { status: Status.Reservation_Reserve_Fail });
        }

        const result = {
            status: Status.Success,
        }
        this.send(req, res, result);
    }

    /** 生成時間表 */
    #createTimeForm(form) {
        let timeForm = {};
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
                            timeForm[date][time] = [];
                        }

                        timeForm[date][time].push({
                            id: data['id'],
                            name: data['name']
                        })
                    }
                });
            })
        });

        // 排序時間
        timeForm = Object.keys(timeForm).sort().reduce((accumulator, key) => {
            accumulator[key] = timeForm[key];
            return accumulator;
        }, {});

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