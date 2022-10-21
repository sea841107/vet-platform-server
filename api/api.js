const Status = require('../common/status');

class Api {
    send(res, result) {
        res.send(JSON.stringify(result));
    }

    invalid() {
        return {
            status: Status.Invalid 
        }
    }
}

module.exports = Api