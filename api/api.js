const md5 = require('md5');
const jwt = require('jsonwebtoken')
const Status = require('../common/status');

class Api {
    #jwtKey = md5('vet-platform')

    send(res, result) {
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
        try {
            const token = authorization.replace('Bearer ', '');
            jwt.verify(token, this.#jwtKey);
        } catch (e) {
            return false
        }
        
        return true;
    }
}

module.exports = Api