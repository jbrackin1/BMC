require('dotenv').config();

const pool = require('../db/pool'); // adjust path if needed
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const test = await pool.query(
      `
  SELECT users.id,
         pgp_sym_decrypt(email::bytea, $1) AS email
  FROM users
`,
      [process.env.PGPCRYPTO_KEY]
    );

    const result = await pool.query(
      `
  SELECT users.id,
         pgp_sym_decrypt(email::bytea, $1) AS email,
         users.password,
         roles.role_name
  FROM users
  JOIN roles ON users.role_id = roles.id
  WHERE pgp_sym_decrypt(email::bytea, $1) = $2
    AND users.is_deleted = false
`,
      [process.env.PGPCRYPTO_KEY, email]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Get IP (fallback-safe)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // ✅ Update login timestamp + IP
    await pool.query(
      `UPDATE users SET last_login = NOW(), last_ip = $1 WHERE id = $2`,
      [ip, user.id]
    );

    // ✅ Insert into audit log
    await pool.query(
      `INSERT INTO audit_log (user_id, action, description, ip_address)
   VALUES ($1, $2, $3, $4)`,
      [user.id, 'LOGIN_SUCCESS', `User ${user.email} logged in`, ip]
    );

    const token = jwt.sign(
      { id: user.id, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role_name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 🔐 Create user — admin only
exports.createUser = async (req, res) => {
  const { username, email, password, display_name, phone, role_id } = req.body;

  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // log admin action
    await pool.query(
      `INSERT INTO audit_log (user_id, action, description, ip_address)
   VALUES ($1, $2, $3, $4)`,
      [
        decoded.id, // the admin who made the request
        'CREATE_USER',
        `Created user: ${username}`,
        req.headers['x-forwarded-for'] || req.socket.remoteAddress
      ]
    );
    const result = await pool.query(
      `INSERT INTO users (
    username,
    email,
    password,
    display_name,
    phone,
    role_id,
    member_since, is_active, is_deleted,
    date_created, date_last_modified, last_modified_by
  ) VALUES (
    pgp_sym_encrypt($1, $8),
    pgp_sym_encrypt($2, $8),
    $3,
    pgp_sym_encrypt($4, $8),
    pgp_sym_encrypt($5, $8),
    $6,
    NOW(), true, false,
    NOW(), NOW(), $7
  ) RETURNING id`,
      [
        username,
        email,
        hashedPassword,
        display_name,
        phone,
        role_id,
        decoded.id,
        process.env.PGPCRYPTO_KEY
      ]
    );

    res
      .status(201)
      .json({ message: 'User created', userId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userId = req.params.id;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    const result = await pool.query(
      `
      SELECT 
        users.id,
        pgp_sym_decrypt(username::bytea, $1) AS username,
        pgp_sym_decrypt(email::bytea, $1) AS email,
        pgp_sym_decrypt(display_name::bytea, $1) AS display_name,
        pgp_sym_decrypt(phone::bytea, $1) AS phone,
        users.role_id,
        roles.role_name,
        users.member_since,
        users.last_login,
        users.last_ip,
        users.is_active,
        users.is_deleted
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = $2 AND users.is_deleted = false
    `,
      [process.env.PGPCRYPTO_KEY, userId]
    );

    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Optional: log audit
    await pool.query(
      `INSERT INTO audit_log (user_id, action, description, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        decoded.id,
        'VIEW_USER',
        `Viewed user ${userId}`,
        req.headers['x-forwarded-for'] || req.socket.remoteAddress
      ]
    );

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

//Return all users - admin only
exports.getAllUsers = async (req, res) => {

  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    const result = await pool.query(
      `
  SELECT 
    users.id,
    pgp_sym_decrypt(username::bytea, $1) AS username,
    pgp_sym_decrypt(email::bytea, $1) AS email,
    pgp_sym_decrypt(display_name::bytea, $1) AS display_name,
    pgp_sym_decrypt(phone::bytea, $1) AS phone,
    users.role_id,
    roles.role_name,
    users.member_since,
    users.last_login,
    users.last_ip,
    users.is_active,
    users.is_deleted
  FROM users
  JOIN roles ON users.role_id = roles.id
  ORDER BY users.date_created DESC
`,
      [process.env.PGPCRYPTO_KEY]
    );
    // 🔍 Audit log (optional but HIPAA-strong)
    await pool.query(
      `INSERT INTO audit_log (user_id, action, description, ip_address, timestamp)
   VALUES ($1, $2, $3, $4, NOW())`,
      [
        decoded.id,
        'VIEW_USERS',
        'Viewed all users',
        req.headers['x-forwarded-for'] || req.socket.remoteAddress
      ]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

//Reset User Pass
exports.resetUserPassword = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { userId, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password = $1, date_last_modified = NOW(), last_modified_by = $2
       WHERE id = $3`,
      [hashedPassword, decoded.id, userId]
    );

    await pool.query(
      `INSERT INTO audit_log (user_id, action, description, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        decoded.id,
        'RESET_PASSWORD',
        `Admin reset password for user ${userId}`,
        req.headers['x-forwarded-for'] || req.socket.remoteAddress
      ]
    );

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Soft delete a user – admin only
exports.deleteUser = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userId = req.params.id;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    await pool.query(
      `UPDATE users
       SET is_deleted = true, date_last_modified = NOW(), last_modified_by = $1
       WHERE id = $2`,
      [decoded.id, userId]
    );

    await pool.query(
      `INSERT INTO audit_log (user_id, action, description, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [
        decoded.id,
        'DELETE_USER',
        `Soft-deleted user ${userId}`,
        req.headers['x-forwarded-for'] || req.socket.remoteAddress
      ]
    );

    res.status(200).json({ message: 'User soft-deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};