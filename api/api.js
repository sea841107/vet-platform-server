const md5 = require('md5');
const jwt = require('jsonwebtoken')
const Status = require('../common/status');
const Logger = require('../logger/logger');

/** jwt密鑰 */
const JWT_KEY = md5('vet-platform');

/** 可忽略token檢查的Api列表 */
const ignoreTokenList = [];

/** 可忽略權限檢查的Api列表 */
const ignorePermissionList = [];

/** 初始化Api */
function init(app) {
    createMiddleware(app);
    createApiModel(app);
}

/** 建立中介軟體 */
function createMiddleware(app) {
    app.use((req, res, next) => {
        // token處理
        const user = verifyToken(req.header('Authorization'));
        if (ignoreTokenList.indexOf(req.url) == -1 && !user) {
            return send(req, res, { status: Status.Token_Invalid });
        }

        // 權限處理
        if (ignorePermissionList.indexOf(req.url) == -1 && !verifyPermission()) {
            return send(req, res, { status: Status.No_Permission });
        }

        res.locals.user = user;

        next()
    })
}

/** 建立Api模型 */
function createApiModel(app) {
    const fs = require('fs');
    const path = require('path');
    const folder = path.join(__dirname, 'model')
    fs.readdirSync(folder).forEach(file => {
        const name = file.split('.')[0];
        const model = require(`./model/${name}`);
        new model(app);
    });
}

/** 回傳訊息 */
function send(req, res, result) {
    res.setHeader('Content-Type', 'application/json')
    const log = `Result:${JSON.stringify(result)} | Body:${JSON.stringify(req.body)}`;
    if (result.status == Status.Success) {
        Logger.info(log);
    } else {
        Logger.error(log);
    }
    res.send(JSON.stringify(result));
}

/** 產生token */
function generateToken(data) {
    const token = jwt.sign(data, JWT_KEY, { expiresIn: '1 day' });
    return token;
}

/** 驗證token */
function verifyToken(authorization) {
    // jwt驗證若失敗，會直接報錯，所以外層包一個try catch
    let data;
    try {
        const token = authorization.replace('Bearer ', '');
        data = jwt.verify(token, JWT_KEY);
    } catch (e) { }

    return data;
}

/** 驗證權限 */
function verifyPermission() {
    // todo
    return true;
}

class ApiModel {
    generateToken = generateToken
    send = send

    /** 註冊Api路由 */
    registerApi(app, method, url, callback, ignoreToken = false, ignorePermission = false) {
        if (method == 'get') {
            app.get(url, callback);
        } else if (method == 'post') {
            app.post(url, callback);
        }

        if (ignoreToken) {
            ignoreTokenList.push(url);
        }

        if (ignorePermission) {
            ignorePermissionList.push(url);
        }
    }

    invalid() {
        return {
            status: Status.Invalid 
        }
    }
}

module.exports = { init, ApiModel }