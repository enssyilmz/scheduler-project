import * as sql from 'mssql';

const config: sql.config = {
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

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  if (!pool) {
    console.log("[DB] Yeni SQL connection pool oluşturuluyor...");
    pool = await sql.connect(config);
    console.log("[DB] SQL connection pool başarıyla oluşturuldu");
  }
  return pool;
}

export async function writeToUsers(data: any) {
  try {
    const pool = await getPool();
    await pool.request()
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
  } catch (err) {
    console.error(`[DB] Users ekleme hatası (${data.username}):`, err);
    return false;
  }
}

export async function updateToUsers(data: any) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('username', sql.NVarChar(50), data.username)
      .input('modify_date', sql.DateTime, new Date())
      .query(`
        UPDATE users
        SET modify_date = @modify_date
        WHERE username = @username
      `);

    return result.rowsAffected[0] > 0;
  } catch (err) {
    console.error(`[DB] Users modify_date güncelleme hatası (${data.username}):`, err);
    return false;
  }
}

export async function writeOrUpdateUser(data: any) {
  try {
    const pool = await getPool();
    
    const checkResult = await pool.request()
      .input('username', sql.NVarChar(50), data.username)
      .query(`SELECT COUNT(*) as count FROM users WHERE username = @username`);
    
    if (checkResult.recordset[0].count > 0) {
      await pool.request()
        .input('username', sql.NVarChar(50), data.username)
        .input('modify_date', sql.DateTime, new Date())
        .query(`
          UPDATE users
          SET modify_date = @modify_date
          WHERE username = @username
        `);
      console.log(`[DB] User güncellendi: ${data.username} (modify_date ayarlandı)`);
    } else {
      await pool.request()
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
  } catch (err) {
    console.error(`[DB] Users upsert hatası (${data.username}):`, err);
    return false;
  }
}

export async function writeToTodos(data: any) {
  try {
    const pool = await getPool();
    await pool.request()
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
  } catch (err) {
    console.error(`[DB] Todos ekleme hatası (${data.title}):`, err);
    return false;
  }
}

export async function updateToTodos(data: any) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, data.userId)
      .input('title', sql.NVarChar(sql.MAX), data.title)
      .input('modify_date', sql.DateTime, new Date())
      .query(`
        UPDATE todos
        SET modify_date = @modify_date
        WHERE userId = @userId AND title = @title
      `);

    return result.rowsAffected[0] > 0;
  } catch (err) {
    console.error(`[DB] Todos modify_date güncelleme hatası (${data.title}):`, err);
    return false;
  }
}

export async function writeOrUpdateTodo(data: any) {
  try {
    const pool = await getPool();
    
    const checkResult = await pool.request()
      .input('userId', sql.Int, data.userId)
      .input('title', sql.NVarChar(sql.MAX), data.title)
      .query(`SELECT COUNT(*) as count FROM todos WHERE userId = @userId AND title = @title`);
    
    if (checkResult.recordset[0].count > 0) {
      await pool.request()
        .input('userId', sql.Int, data.userId)
        .input('title', sql.NVarChar(sql.MAX), data.title)
        .input('modify_date', sql.DateTime, new Date())
        .query(`
          UPDATE todos
          SET modify_date = @modify_date
          WHERE userId = @userId AND title = @title
        `);
      console.log(`[DB] Todo güncellendi: ${data.title} (modify_date ayarlandı)`);
    } else {
      await pool.request()
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
  } catch (err) {
    console.error(`[DB] Todos upsert hatası (${data.title}):`, err);
    return false;
  }
}

export async function writeToServiceAppConfig(data: any) {
  try {
    const pool = await getPool();
    
    const checkResult = await pool.request()
      .input('key', sql.NVarChar(50), data.username)
      .query(`SELECT COUNT(*) as count FROM tb_service_app_config WHERE [key] = @key`);
    
    if (checkResult.recordset[0].count === 0) {
      await pool.request()
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
  } catch (err) {
    console.error(`[DB] tb_service_app_config ekleme hatası (${data.username}):`, err);
    return false;
  }
}
