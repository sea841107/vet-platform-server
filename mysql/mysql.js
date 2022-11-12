const mysql = require('mysql');
const Config = require('../common/config');
const Logger = require('../logger/logger');

const pool = mysql.createPool(Config.MySql);

async function query(sql) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, conn) {
            if (err) {
                Logger.error(err);
                resolve();
                return;
            } else {
                conn.query(sql, function (err, rows) {
                    if (err) {
                        Logger.error(err);
                    }
                    conn.release();
                    resolve(rows);
                });
            }
        });
    })
}

module.exports = { query };