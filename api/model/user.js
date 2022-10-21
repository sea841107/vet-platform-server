const jwt = require('jsonwebtoken')
const Status = require('../../common/status');
const Api = require('../api');

class User extends Api {
    constructor(app) {
        super();
        app.post('/user/register', this.#register.bind(this));
        app.post('/user/login', this.#login.bind(this));
        app.post('/user/testToken', this.#testToken.bind(this));
    }

    #register(req, res) {
        this.send(res, this.invalid());
    }

    #login(req, res) {
        const status = this.#loginCheck(req);
        if (status != Status.Success) {
            this.send(res, { status });
            return;
        }

        const token = jwt.sign(req.body, 'test', {expiresIn: '1 day'});
        const result = {
            status: Status.Success,
            token: token
        }
        this.send(res, result);
    }

    #testToken(req, res) {
        try {
            const token = req.header('Authorization').replace('Bearer ', '');
            const data = jwt.verify(token, 'test');
            this.send(res, data);
        } catch(e) {
            const status = Status.Token_Invalid;
            this.send(res, { status });
            return
        }
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