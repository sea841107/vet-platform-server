const mysql = require('mysql');
const Config = require('../common/config');

const pool = mysql.createPool(Config.MySql);

async function query(sql) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, conn) {
            if (err) {
                resolve();
                return;
            } else {
                conn.query(sql, function (err, rows) {
                    conn.release();
                    resolve(rows);
                });
            }
        });
    })
}

module.exports = { query };