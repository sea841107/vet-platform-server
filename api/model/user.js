const Status = require('../../common/status');
const Api = require('../api');
const MySql = require('../../mysql/mysql');

class User extends Api {
    constructor(app) {
        super();
        app.post('/user/register', this.#register.bind(this));
        app.post('/user/login', this.#login.bind(this));
        app.post('/user/testToken', this.#testToken.bind(this));
    }

    async #register(req, res) {
        const status = this.#registerCheck(req);
        if (status != Status.Success) {
            return this.send(res, { status });
        }

        const sql = `INSERT INTO user (user_id, password) VALUES ('${req.body.userId}', '${req.body.password}')`;
        const rows = await MySql.query(sql);
        if (!rows) {
            return this.send(res, { status: Status.Register_Fail });
        }

        this.send(res, { status });
    }

    async #login(req, res) {
        const status = this.#loginCheck(req);
        if (status != Status.Success) {
            return this.send(res, { status });
        }

        const sql = `SELECT password from user WHERE user_id = '${req.body.userId}'`;
        const rows = await MySql.query(sql, Status.Login_Fail);
        if (!rows) {
            return this.send(res, { status: Status.Login_Fail });
        }

        if (rows[0].password != req.body.password) {
            return this.send(res, { status: Status.Login_Password_Incorrect });
        }

        const token = this.generateToken(req.body);
        const result = {
            status: Status.Success,
            token: token
        }
        this.send(res, result);
    }

    #testToken(req, res) {
        if (!this.verifyToken(req.header('Authorization'))) {
            return this.send(res, { status: Status.Token_Invalid });
        }

        this.send(res, { status: Status.Success });
    }

    #registerCheck(req) {
        if (!req.body.userId) {
            return Status.Login_UserId_Invalid;
        }
        if (!req.body.password) {
            return Status.Login_Password_Invalid;
        }

        return Status.Success;
    }

    #loginCheck(req) {
        if (!req.body.userId) {
            return Status.Login_UserId_Invalid;
        }
        if (!req.body.password) {
            return Status.Login_Password_Invalid;
        }

        return Status.Success;
    }
}

module.exports = User