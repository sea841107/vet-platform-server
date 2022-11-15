const Status = require('../../common/status');
const Api = require('../api');
const MySql = require('../../mysql/mysql');

class Doctor extends Api.ApiModel {
    constructor(app) {
        super();
        this.registerApi(app, 'post', '/doctor/list', this.#list.bind(this));
    }

    /** 醫生列表 */
    async #list(req, res) {
        const status = this.#listCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }

        let sql = `SELECT * from doctor WHERE clinic_id = ${req.body.clinicId}`;

        // 種類
        if (req.body.type) {
            sql += ` AND experts like '%${req.body.type}%'`;
        }
        
        const rows = await MySql.query(sql);
        if (!rows) {
            return this.send(req, res, { status: Status.Doctor_List_Fail });
        }

        console.log(sql)

        const dataList = [];
        rows.forEach(row => {
            const data = {
                id: row['id'],
                name: row['name'],
                gender: row['gender'],
                picture: row['picture'],
                experts: row['experts'].split(','),
                remark: row['remark']
            }

            dataList.push(data);
        });

        const result = {
            status: Status.Success,
            data: dataList
        }
        this.send(req, res, result);
    }

    #listCheck(req) {
        if (!req.body.hasOwnProperty('clinicId')) {
            return Status.Doctor_List_ClinicId_Invalid;
        }

        return Status.Success;
    }
}

module.exports = Doctor