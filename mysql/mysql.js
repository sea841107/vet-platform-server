const mysql = require('mysql');
const Config = require('../common/config');

class MySql {
    #pool

    constructor() {
        this.#pool = mysql.createPool(Config.MySql);
    }

    query(sql) {
        this.#pool.getConnection(function (err, conn) {
            if (err) {
                console.log(err);
                return;
            } else {
                conn.query(sql, function (err, rows) {
                    conn.release();
                    if (err) {
                        console.log(err);
                        return;
                    }
                });
            }
        });
    }
}

module.exports = new MySql();