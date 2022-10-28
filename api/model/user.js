const Status = require('../../common/status');
const Api = require('../api');
const MySql = require('../../mysql/mysql');

class User extends Api {
    #frontTable = 'front_user'
    #backTable = 'back_user'

    constructor(app) {
        super();
        app.post('/user/front/register', this.#frontRegister.bind(this));
        app.post('/user/front/login', this.#frontLogin.bind(this));
        app.post('/user/back/register', this.#backRegister.bind(this));
        app.post('/user/back/login', this.#backLogin.bind(this));
        app.post('/user/testToken', this.#testToken.bind(this));
    }

    async #register(req, res, table) {
        const status = this.#registerCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }

        const sql = `INSERT INTO ${table} (user_id, password) VALUES ('${req.body.userId}', '${req.body.password}')`;
        const rows = await MySql.query(sql);
        if (!rows) {
            return this.send(req, res, { status: Status.Register_Fail });
        }

        const result = {
            status: Status.Success,
            data: {
                userId: req.body.userId,
                password: req.body.password
            }
        }
        this.send(req, res, result);
    }

    async #frontRegister(req, res) {
        this.#register(req, res, this.#frontTable);
    }

    async #backRegister(req, res) {
        this.#register(req, res, this.#backTable);
    }

    async #login(req, res, table) {
        const status = this.#loginCheck(req);
        if (status != Status.Success) {
            return this.send(req, res, { status });
        }

        const sql = `SELECT password from ${table} WHERE user_id = '${req.body.userId}'`;
        const rows = await MySql.query(sql, Status.Login_Fail);
        if (!rows || rows.length == 0) {
            return this.send(req, res, { status: Status.Login_Fail });
        }

        if (rows[0].password != req.body.password) {
            return this.send(req, res, { status: Status.Login_Password_Incorrect });
        }

        const token = this.generateToken(req.body);
        const result = {
            status: Status.Success,
            data: {
                token
            }
        }
        this.send(req, res, result);
    }

    #frontLogin(req, res) {
        this.#login(req, res, this.#frontTable);
    }

    #backLogin(req, res) {
        this.#login(req, res, this.#backTable);
    }

    #testToken(req, res) {
        if (!this.verifyToken(req.header('Authorization'))) {
            return this.send(req, res, { status: Status.Token_Invalid });
        }

        this.send(req, res, { status: Status.Success });
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