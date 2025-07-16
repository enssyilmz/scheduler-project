"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
exports.writeToUsers = writeToUsers;
exports.updateToUsers = updateToUsers;
exports.writeOrUpdateUser = writeOrUpdateUser;
exports.writeToTodos = writeToTodos;
exports.updateToTodos = updateToTodos;
exports.writeOrUpdateTodo = writeOrUpdateTodo;
exports.writeToServiceAppConfig = writeToServiceAppConfig;
const sql = __importStar(require("mssql"));
const config = {
    user: 'sa',
    password: '123456',
    server: process.env.SQL_SERVER || 'localhost',
    database: 'Softtech',
    options: {
        trustServerCertificate: true,
        encrypt: false,
        enableArithAbort: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};
let pool = null;
function getPool() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!pool) {
            console.log("[DB] Yeni SQL connection pool oluşturuluyor...");
            pool = yield sql.connect(config);
            console.log("[DB] SQL connection pool başarıyla oluşturuldu");
        }
        return pool;
    });
}
function writeToUsers(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield getPool();
            yield pool.request()
                .input('name', sql.NVarChar(50), data.name)
                .input('username', sql.NVarChar(50), data.username)
                .input('email', sql.NVarChar(50), data.email)
                .input('phone', sql.NVarChar(sql.MAX), data.phone)
                .input('website', sql.NVarChar(50), data.website)
                .input('create_user', sql.NVarChar(50), 'system')
                .input('create_date', sql.DateTime, new Date())
                .query(`
        INSERT INTO users (name, username, email, phone, website, create_user, create_date)
        VALUES (@name, @username, @email, @phone, @website, @create_user, @create_date)
      `);
            return true;
        }
        catch (err) {
            console.error(`[DB] Users ekleme hatası (${data.username}):`, err);
            return false;
        }
    });
}
function updateToUsers(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield getPool();
            const result = yield pool.request()
                .input('username', sql.NVarChar(50), data.username)
                .input('modify_date', sql.DateTime, new Date())
                .query(`
        UPDATE users
        SET modify_date = @modify_date
        WHERE username = @username
      `);
            return result.rowsAffected[0] > 0;
        }
        catch (err) {
            console.error(`[DB] Users modify_date güncelleme hatası (${data.username}):`, err);
            return false;
        }
    });
}
function writeOrUpdateUser(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield getPool();
            const checkResult = yield pool.request()
                .input('username', sql.NVarChar(50), data.username)
                .query(`SELECT COUNT(*) as count FROM users WHERE username = @username`);
            if (checkResult.recordset[0].count > 0) {
                yield pool.request()
                    .input('username', sql.NVarChar(50), data.username)
                    .input('modify_date', sql.DateTime, new Date())
                    .query(`
          UPDATE users
          SET modify_date = @modify_date
          WHERE username = @username
        `);
                console.log(`[DB] User güncellendi: ${data.username} (modify_date ayarlandı)`);
            }
            else {
                yield pool.request()
                    .input('name', sql.NVarChar(50), data.name)
                    .input('username', sql.NVarChar(50), data.username)
                    .input('email', sql.NVarChar(50), data.email)
                    .input('phone', sql.NVarChar(sql.MAX), data.phone)
                    .input('website', sql.NVarChar(50), data.website)
                    .input('create_user', sql.NVarChar(50), 'system')
                    .input('create_date', sql.DateTime, new Date())
                    .query(`
          INSERT INTO users (name, username, email, phone, website, create_user, create_date)
          VALUES (@name, @username, @email, @phone, @website, @create_user, @create_date)
        `);
            }
            return true;
        }
        catch (err) {
            console.error(`[DB] Users upsert hatası (${data.username}):`, err);
            return false;
        }
    });
}
function writeToTodos(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield getPool();
            yield pool.request()
                .input('userId', sql.Int, data.userId)
                .input('title', sql.NVarChar(sql.MAX), data.title)
                .input('completed', sql.Bit, data.completed)
                .input('create_user', sql.NVarChar(50), 'system')
                .input('create_date', sql.DateTime, new Date())
                .query(`
        INSERT INTO todos (userId, title, completed, create_user, create_date)
        VALUES (@userId, @title, @completed, @create_user, @create_date)
      `);
            return true;
        }
        catch (err) {
            console.error(`[DB] Todos ekleme hatası (${data.title}):`, err);
            return false;
        }
    });
}
function updateToTodos(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield getPool();
            const result = yield pool.request()
                .input('userId', sql.Int, data.userId)
                .input('title', sql.NVarChar(sql.MAX), data.title)
                .input('modify_date', sql.DateTime, new Date())
                .query(`
        UPDATE todos
        SET modify_date = @modify_date
        WHERE userId = @userId AND title = @title
      `);
            return result.rowsAffected[0] > 0;
        }
        catch (err) {
            console.error(`[DB] Todos modify_date güncelleme hatası (${data.title}):`, err);
            return false;
        }
    });
}
function writeOrUpdateTodo(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield getPool();
            const checkResult = yield pool.request()
                .input('userId', sql.Int, data.userId)
                .input('title', sql.NVarChar(sql.MAX), data.title)
                .query(`SELECT COUNT(*) as count FROM todos WHERE userId = @userId AND title = @title`);
            if (checkResult.recordset[0].count > 0) {
                yield pool.request()
                    .input('userId', sql.Int, data.userId)
                    .input('title', sql.NVarChar(sql.MAX), data.title)
                    .input('modify_date', sql.DateTime, new Date())
                    .query(`
          UPDATE todos
          SET modify_date = @modify_date
          WHERE userId = @userId AND title = @title
        `);
                console.log(`[DB] Todo güncellendi: ${data.title} (modify_date ayarlandı)`);
            }
            else {
                yield pool.request()
                    .input('userId', sql.Int, data.userId)
                    .input('title', sql.NVarChar(sql.MAX), data.title)
                    .input('completed', sql.Bit, data.completed)
                    .input('create_user', sql.NVarChar(50), 'system')
                    .input('create_date', sql.DateTime, new Date())
                    .query(`
          INSERT INTO todos (userId, title, completed, create_user, create_date)
          VALUES (@userId, @title, @completed, @create_user, @create_date)
        `);
            }
            return true;
        }
        catch (err) {
            console.error(`[DB] Todos upsert hatası (${data.title}):`, err);
            return false;
        }
    });
}
function writeToServiceAppConfig(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield getPool();
            const checkResult = yield pool.request()
                .input('key', sql.NVarChar(50), data.username)
                .query(`SELECT COUNT(*) as count FROM tb_service_app_config WHERE [key] = @key`);
            if (checkResult.recordset[0].count === 0) {
                yield pool.request()
                    .input('key', sql.NVarChar(50), data.username)
                    .input('status', sql.NVarChar(50), 'active')
                    .input('datetime', sql.DateTime, new Date())
                    .input('users', sql.NVarChar(50), data.name)
                    .query(`
          INSERT INTO tb_service_app_config ([key], status, datetime, users)
          VALUES (@key, @status, @datetime, @users)
        `);
            }
            return true;
        }
        catch (err) {
            console.error(`[DB] tb_service_app_config ekleme hatası (${data.username}):`, err);
            return false;
        }
    });
}
//# sourceMappingURL=db.js.map