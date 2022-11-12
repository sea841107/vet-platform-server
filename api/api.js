const md5 = require('md5');
const jwt = require('jsonwebtoken')
const Status = require('../common/status');
const Logger = require('../logger/logger');

class Api {
    #jwtKey = md5('vet-platform')

    send(req, res, result) {
        res.setHeader('Content-Type', 'application/json')
        const log = `Result:${JSON.stringify(result)} | Body:${JSON.stringify(req.body) }`;
        if (result.status == Status.Success) {
            Logger.info(log);
        } else {
            Logger.error(log);
        }
        res.send(JSON.stringify(result));
    }

    invalid() {
        return {
            status: Status.Invalid 
        }
    }

    generateToken(data) {
        const token = jwt.sign(data, this.#jwtKey, { expiresIn: '1 day' });
        return token;
    }

    verifyToken(authorization) {
        // jwt驗證若失敗，會直接報錯，所以外層包一個try catch
        let data;
        try {
            const token = authorization.replace('Bearer ', '');
            data = jwt.verify(token, this.#jwtKey);
        } catch (e) {}
        
        return data;
    }
}

module.exports = Api