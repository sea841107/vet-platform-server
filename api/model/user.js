const Status = require('../../common/status');
const Api = require('../api');
const MySql = require('../../mysql/mysql');

class User extends Api.ApiModel {
    #frontTable = 'front_user'
    #backTable = 'back_user'

    constructor(app) {
        super();
        this.registerApi(app, 'post', '/user/front/register', this.#frontRegister.bind(this), true);
        this.registerApi(app, 'post', '/user/front/login', this.#frontLogin.bind(this), true);
        this.registerApi(app, 'post', '/user/back/login', this.#backLogin.bind(this), true);

        this.registerApi(app, 'get', '/user/front/member', this.#frontMember.bind(this));
    }

    /** 前台註冊 */
    async #frontRegister(req, res) {
        const status = this.#registerCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }

        const sql = `INSERT INTO ${this.#frontTable} (account, password) VALUES ('${req.body.account}', '${req.body.password}')`;
        const rows = await MySql.query(sql);
        if (!rows) {
            return this.send(req, res, { status: Status.Register_Fail });
        }

        const result = {
            status: Status.Success,
            data: {
                account: req.body.account,
                password: req.body.password
            }
        }
        this.send(req, res, result);
    }

    async #login(req, res, table) {
        const status = this.#loginCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }

        const sql = `SELECT * from ${table} WHERE account = '${req.body.account}'`;
        const rows = await MySql.query(sql, Status.Login_Fail);
        if (!rows || rows.length == 0) {
            return this.send(req, res, { status: Status.Login_Fail });
        }

        if (rows[0].password != req.body.password) {
            return this.send(req, res, { status: Status.Login_Password_Incorrect });
        }

        const tokenData = {
            id: rows[0].id,
            account: rows[0].account
        }
        const token = this.generateToken(tokenData);
        const result = {
            status: Status.Success,
            data: {
                token
            }
        }
        this.send(req, res, result);
    }

    /** 前台會員 */
    #frontMember(req, res) {
        const result = {
            status: Status.Success,
            data: {
                account: res.locals.user.account
            }
        }
        this.send(req, res, result);
    }

    /** 前台登入 */
    #frontLogin(req, res) {
        this.#login(req, res, this.#frontTable);
    }

    /** 後台註冊 */
    #backLogin(req, res) {
        this.#login(req, res, this.#backTable);
    }

    #registerCheck(req) {
        if (!req.body.hasOwnProperty('account')) {
            return Status.Login_Account_Invalid;
        }
        if (!req.body.hasOwnProperty('password')) {
            return Status.Login_Password_Invalid;
        }

        return Status.Success;
    }

    #loginCheck(req) {
        if (!req.body.hasOwnProperty('account')) {
            return Status.Login_Account_Invalid;
        }
        if (!req.body.hasOwnProperty('password')) {
            return Status.Login_Password_Invalid;
        }

        return Status.Success;
    }
}

module.exports = User