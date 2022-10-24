const fs = require('fs');
const path = require('path');

const Server = {
    Port: 3000,
}

const MySql = {
    user: 'vet_admin',
    password: 'g.4u qu/6w96',
    host: 'vet-platform-db.mysql.database.azure.com',
    port: '3306',
    database: 'platform',
    ssl: { ca: fs.readFileSync(path.join(__dirname, 'DigiCertGlobalRootCA.crt.pem')) },
    connectionLimit: 100
}

module.exports = {
    Server, MySql
}