require('dotenv').config({
  path: require('path').resolve(__dirname, '../../../.env')
});

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const knex = require('../db/knex');
const dayjs = require('dayjs');
const { sendMfaCode } = require('../../utils/email');
const { info } = require('console');
const { v4: uuidv4 } = require('uuid');
const { sendPasswordResetEmail } = require('../../utils/email'); // adjust path if needed
const key = process.env.PGPCRYPTO_KEY;
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// 🔌 Enable the plugins
dayjs.extend(utc);
dayjs.extend(timezone);
function getCentralTimestamp() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss'); // ISO 8601 string in CDT/CST
}

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await knex('users')
      .select(
        'users.id',
        knex.raw('pgp_sym_decrypt(email::bytea, ?) AS email', [
          process.env.PGPCRYPTO_KEY
        ]),
        'users.password',
        'roles.role_name'
      )
      .join('roles', 'users.role_id', 'roles.id')
      .whereRaw('pgp_sym_decrypt(email::bytea, ?) = ?', [
        process.env.PGPCRYPTO_KEY,
        email
      ])
      .andWhere('users.is_deleted', false)
      .first();

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    await knex('users')
      .where({ id: user.id })
      .update({ last_login: knex.fn.now(), last_ip: ip });

    await knex('audit_log').insert({
      user_id: user.id,
      action: 'LOGIN_ATTEMPT',
      description: `User ${user.email} passed initial login, awaiting MFA`,
      ip_address: ip,
      timestamp: getCentralTimestamp()
    });

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expires = dayjs().add(10, 'minute').toISOString();

    await knex('users')
      .where({ id: user.id })
      .update({ mfa_code: code, mfa_expires_at: expires });

    await sendMfaCode(user.email, code);

    return res.status(200).json({
      message: 'MFA code sent to your email. Please verify to continue.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 🧼 Logout: clears secure cookie
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out' });
};

// 🔐 Session check: uses `req.user` from middleware
exports.getMe = (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ user: req.user });
};

exports.createUser = async (req, res) => {
  const {
    username,
    email,
    password,
    display_name,
    first_name,
    last_name,
    phone,
    role_id,
    gender = ''
  } = req.body;
  const decoded = req.user;

  // 🔐 ENV key safety check
  const key = process.env.PGPCRYPTO_KEY;
  if (!key) {
    console.error('❌ Missing PGPCRYPTO_KEY in environment.');
    return res.status(500).json({ error: 'Encryption key not found' });
  }

  // 🐛 Field check log
  console.log('[createUser DEBUG]', {
    username,
    email,
    password,
    display_name,
    first_name,
    last_name,
    phone,
    role_id,
    gender,
    keyLoaded: key?.slice(0, 4) + '***'
  });

  try {
    if (decoded.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    if (
      !username ||
      !email ||
      !password ||
      !display_name ||
      !phone ||
      !role_id
    ) {
      return res.status(400).json({ error: 'Missing required user fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await knex('users')
      .returning('id')
      .insert({
        password: hashedPassword,
        role_id,
        member_since: knex.fn.now(),
        is_active: true,
        is_deleted: false,
        has_paid: false,
        date_created: knex.fn.now(),
        date_last_modified: knex.fn.now(),
        last_modified_by: decoded.id,
        username: knex.raw('pgp_sym_encrypt(?, ?)', [username, key]),
        email: knex.raw('pgp_sym_encrypt(?, ?)', [email, key]),
        display_name: knex.raw('pgp_sym_encrypt(?, ?)', [display_name, key]),
        first_name: knex.raw('pgp_sym_encrypt(?, ?)', [first_name || '', key]),
        last_name: knex.raw('pgp_sym_encrypt(?, ?)', [last_name || '', key]),
        phone: knex.raw('pgp_sym_encrypt(?, ?)', [phone, key]),
        gender: knex.raw('pgp_sym_encrypt(?, ?)', [gender || '', key])
      });

    const newUserId = result[0].id || result[0]; // Knex version fallback

    await knex('audit_log').insert({
      user_id: decoded.id,
      action: 'CREATE_USER',
      description: `Created user: ${username}`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    res.status(201).json({ message: 'User created', userId: newUserId });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({ error: 'Server error during user creation' });
  }
};

// Admin-only Get User by ID
exports.getUserById = async (req, res) => {
  const decoded = req.user;
  const userId = req.params.id;

  try {
    if (
      !decoded ||
      !['admin', 'superadmin'].includes(decoded.role.toLowerCase())
    ) {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    const [user] = await knex('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select(
        'users.id',
        knex.raw('pgp_sym_decrypt(username::bytea, ?) AS username', [
          process.env.PGPCRYPTO_KEY
        ]),
        knex.raw('pgp_sym_decrypt(email::bytea, ?) AS email', [
          process.env.PGPCRYPTO_KEY
        ]),
        knex.raw('pgp_sym_decrypt(display_name::bytea, ?) AS display_name', [
          process.env.PGPCRYPTO_KEY
        ]),
        knex.raw('pgp_sym_decrypt(phone::bytea, ?) AS phone', [
          process.env.PGPCRYPTO_KEY
        ]),
        knex.raw('pgp_sym_decrypt(gender::bytea, ?) AS gender', [
          process.env.PGPCRYPTO_KEY
        ]),
        'users.role_id',
        'roles.role_name',
        'users.member_since',
        'users.last_login',
        'users.last_ip',
        'users.is_active',
        'users.is_deleted',
        'users.has_paid'
      )
      .where('users.id', userId)
      .andWhere('users.is_deleted', false);

    if (!user) return res.status(404).json({ error: 'User not found' });

    await knex('audit_log').insert({
      user_id: decoded.id,
      action: 'VIEW_USER',
      description: `Viewed user ${userId}`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  const decoded = req.user;

  const role = decoded.role?.toLowerCase();
  if (role !== 'admin' && role !== 'superadmin') {
    return res
      .status(403)
      .json({ error: 'Access denied: Admins or SuperAdmins only' });
  }

  try {
    const users = await knex('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select([
        'users.id',
        knex.raw('pgp_sym_decrypt(username::bytea, ?) as username', [
          process.env.PGPCRYPTO_KEY
        ]),
        knex.raw('pgp_sym_decrypt(email::bytea, ?) as email', [
          process.env.PGPCRYPTO_KEY
        ]),
        knex.raw('pgp_sym_decrypt(display_name::bytea, ?) as display_name', [
          process.env.PGPCRYPTO_KEY
        ]),
        knex.raw('pgp_sym_decrypt(first_name::bytea, ?) as first_name', [
          process.env.PGPCRYPTO_KEY
        ]),
        knex.raw('pgp_sym_decrypt(last_name::bytea, ?) as last_name', [
          process.env.PGPCRYPTO_KEY
        ]),
        knex.raw('pgp_sym_decrypt(phone::bytea, ?) as phone', [
          process.env.PGPCRYPTO_KEY
        ]),
        knex.raw(
          'CASE WHEN gender IS NOT NULL THEN pgp_sym_decrypt(gender::bytea, ?) ELSE NULL END as gender',
          [process.env.PGPCRYPTO_KEY]
        ),
        'users.role_id',
        'roles.role_name',
        'users.member_since',
        'users.last_login',
        'users.last_ip',
        'users.is_active',
        'users.is_deleted',
        'users.date_created',
        'users.has_paid'
      ])
      .orderBy('users.date_created', 'desc');

    await knex('audit_log').insert({
      user_id: decoded.id,
      action: 'VIEW_USERS',
      description: 'Viewed all users',
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetUserPassword = async (req, res) => {
  const decoded = req.user;
  const { userId, newPassword } = req.body;

  try {
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await knex('users').where({ id: userId }).update({
      password: hashedPassword,
      date_last_modified: knex.fn.now(),
      last_modified_by: decoded.id
    });

    await knex('audit_log').insert({
      user_id: decoded.id,
      action: 'RESET_PASSWORD',
      description: `Admin reset password for user ${userId}`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Step 1: Look up the user by decrypted email
    const result = await knex('users')
      .select('id')
      .whereRaw('pgp_sym_decrypt(email::bytea, ?) = ?', [
        process.env.PGPCRYPTO_KEY,
        email
      ]);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id } = result[0];

    // Step 2: Generate token + hash
    const token = uuidv4();
    const tokenHash = await bcrypt.hash(token, 10);
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    // Step 3: Save hashed token in DB
    await knex('password_resets').insert({
      user_id: id,
      token_hash: tokenHash,
      expires_at: expires
    });

    // Step 4: Send email with token (raw) to user
    await sendPasswordResetEmail(email, token); // token is used in link

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('❌ Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin-only Soft Delete User
exports.deleteUser = async (req, res) => {
  const decoded = req.user;
  const userId = req.params.id;

  try {
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    await knex('users').where({ id: userId }).update({
      is_deleted: true,
      is_active: false,
      date_last_modified: knex.fn.now(),
      last_modified_by: decoded.id
    });

    await knex('audit_log').insert({
      user_id: decoded.id,
      action: 'DELETE_USER',
      description: `Soft-deleted user ${userId}`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    res.status(200).json({ message: 'User soft-deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyMfa = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await knex('users')
      .select(
        'users.id',
        'users.role_id', // 🆕 grab role_id directly
        'users.mfa_code',
        'users.mfa_expires_at',
        'users.has_paid'
      )
      .whereRaw('pgp_sym_decrypt(users.email::bytea, ?) = ?', [
        process.env.PGPCRYPTO_KEY,
        email
      ])
      .first();

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired MFA code' });
    }

    if (user.mfa_code !== code || dayjs().isAfter(user.mfa_expires_at)) {
      return res.status(401).json({ error: 'Invalid or expired MFA code' });
    }

    // ✅ Fetch latest role_name based on role_id
    const roleRow = await knex('roles')
      .select('role_name')
      .where({ id: user.role_id })
      .first();

    if (!roleRow) {
      return res.status(400).json({ error: 'User role not found' });
    }

    await knex('users')
      .where({ id: user.id })
      .update({ mfa_code: null, mfa_expires_at: null });

    await knex('audit_log').insert({
      user_id: user.id,
      action: 'MFA_SUCCESS',
      description: `User ${email} passed MFA verification`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    const token = jwt.sign(
      {
        id: user.id,
        role: roleRow.role_name,
        email,
        has_paid: user.has_paid
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000
    });

    res.json({
      message: 'Authenticated successfully',
      user: {
        id: user.id,
        email,
        role: roleRow.role_name,
        has_paid: user.has_paid
      }
    });
  } catch (err) {
    console.error('MFA verification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAuditLog = async (req, res) => {
  const decoded = req.user;

  if (
    !decoded ||
    !['admin', 'superadmin'].includes(decoded.role.toLowerCase())
  ) {
    return res.status(403).json({ error: 'Access denied: Admins only' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const { page = 1, limit = 100, action, user_id } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const safeLimit = Math.min(parseInt(limit), 500);

  try {
    const logs = await knex('audit_log')
      .select(
        'audit_log.id',
        'audit_log.user_id',
        'audit_log.action',
        'audit_log.description',
        'audit_log.ip_address',
        'audit_log.timestamp',
        'users.has_paid'
      )
      .leftJoin('users', 'audit_log.user_id', 'users.id')
      .orderBy('audit_log.timestamp', 'desc')
      .limit(safeLimit)
      .offset(offset)
      .modify((queryBuilder) => {
        if (action) queryBuilder.where('audit_log.action', action);
        if (user_id) queryBuilder.where('audit_log.user_id', user_id);
      });

    const clientTime = req.headers['x-client-time'];
    const clientTimeZone = req.headers['x-client-timezone'];

    // 🛑 Check if the last log was already a VIEW_AUDIT_LOG in the last 3 seconds
    const recent = await knex('audit_log')
      .where({ user_id: decoded.id, action: 'VIEW_AUDIT_LOG' })
      .andWhere('timestamp', '>', knex.raw(`NOW() - INTERVAL '3 seconds'`))
      .orderBy('timestamp', 'desc')
      .first();

    if (!recent) {
      await knex('audit_log').insert({
        user_id: decoded.id,
        action: 'VIEW_AUDIT_LOG',
        description:
          action || user_id
            ? `Viewed filtered audit log: ${action || ''}${user_id ? ` for user ${user_id}` : ''}`
            : 'Viewed audit log',
        ip_address: ip,
        timestamp: new Date()
      });
    }

    res.json({ page: parseInt(page), count: logs.length, logs });
  } catch (err) {
    console.error('❌ Error retrieving audit log:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.reactivateUser = async (req, res) => {
  const decoded = req.user;
  const { userId } = req.body;

  try {
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    await knex('users').where({ id: userId }).update({
      is_deleted: false,
      is_active: true,
      has_paid: true, // 👈 Added here
      date_last_modified: knex.fn.now(),
      last_modified_by: decoded.id
    });

    await knex('audit_log').insert({
      user_id: decoded.id,
      action: 'REACTIVATE_USER',
      description: `Admin reactivated user ${userId} and marked has_paid = true`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    res.json({ message: 'User reactivated and marked as paid' });
  } catch (err) {
    console.error('Error reactivating user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  const {
    userId,
    username,
    email,
    display_name,
    phone,
    role_id,
    gender,
    has_paid
  } = req.body;
  const decoded = req.user;

  try {
    const role = decoded.role?.toLowerCase();
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    const updatePayload = {
      role_id,
      date_last_modified: knex.fn.now(),
      last_modified_by: decoded.id
    };

    if (username !== undefined) {
      updatePayload.username = knex.raw('pgp_sym_encrypt(?, ?)', [
        username,
        process.env.PGPCRYPTO_KEY
      ]);
    }
    if (email !== undefined) {
      updatePayload.email = knex.raw('pgp_sym_encrypt(?, ?)', [
        email,
        process.env.PGPCRYPTO_KEY
      ]);
    }
    if (display_name !== undefined) {
      updatePayload.display_name = knex.raw('pgp_sym_encrypt(?, ?)', [
        display_name,
        process.env.PGPCRYPTO_KEY
      ]);
    }
    if (phone !== undefined) {
      updatePayload.phone = knex.raw('pgp_sym_encrypt(?, ?)', [
        phone,
        process.env.PGPCRYPTO_KEY
      ]);
    }
    if (gender !== undefined) {
      updatePayload.gender = knex.raw('pgp_sym_encrypt(?, ?)', [
        gender || '',
        process.env.PGPCRYPTO_KEY
      ]);
    }
    if (has_paid !== undefined) {
      updatePayload.has_paid = has_paid;
    }

    await knex('users').where({ id: userId }).update(updatePayload);

    await knex('audit_log').insert({
      user_id: decoded.id,
      action: 'UPDATE_USER',
      description: `Updated user ${userId}${has_paid !== undefined ? ` (has_paid = ${has_paid})` : ''}`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    // 🔁 Re-issue token if current user updated their own email or role
    if (userId === decoded.id) {
      const roleRow = await knex('roles')
        .select('role_name')
        .where({ id: role_id })
        .first();
      const userRow = await knex('users')
        .select(
          knex.raw('pgp_sym_decrypt(email::bytea, ?) as email', [
            process.env.PGPCRYPTO_KEY
          ])
        )
        .where({ id: decoded.id })
        .first();

      const newToken = jwt.sign(
        {
          id: decoded.id,
          role: roleRow.role_name,
          email: userRow.email,
          has_paid: has_paid ?? decoded.has_paid
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // 🚨 This line ensures old cookies don’t linger
      res.clearCookie('token');

      // 🚨 This line re-sets the new token
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 60 * 60 * 1000
      });

      return res.json({ message: 'User updated + token refreshed' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateMyProfile = async (req, res) => {
  const userId = req.user.id;
  const { email, first_name, last_name, phone, gender } = req.body;

  try {
    const updatePayload = {
      date_last_modified: knex.fn.now(),
      last_modified_by: userId
    };

    const emailWasUpdated = email !== undefined;

    if (emailWasUpdated) {
      updatePayload.email = knex.raw('pgp_sym_encrypt(?, ?)', [
        email,
        process.env.PGPCRYPTO_KEY
      ]);
    }
    if (first_name !== undefined) {
      updatePayload.first_name = knex.raw('pgp_sym_encrypt(?, ?)', [
        first_name,
        process.env.PGPCRYPTO_KEY
      ]);
    }
    if (last_name !== undefined) {
      updatePayload.last_name = knex.raw('pgp_sym_encrypt(?, ?)', [
        last_name,
        process.env.PGPCRYPTO_KEY
      ]);
    }
    if (phone !== undefined) {
      updatePayload.phone = knex.raw('pgp_sym_encrypt(?, ?)', [
        phone,
        process.env.PGPCRYPTO_KEY
      ]);
    }
    if (gender !== undefined) {
      updatePayload.gender = knex.raw('pgp_sym_encrypt(?, ?)', [
        gender,
        process.env.PGPCRYPTO_KEY
      ]);
    }

    await knex('users').where({ id: userId }).update(updatePayload);

    await knex('audit_log').insert({
      user_id: userId,
      action: 'SELF_UPDATE_PROFILE',
      description: `User updated their profile fields`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    // 🔁 Refresh JWT if email changed
    if (emailWasUpdated) {
      const [updated] = await knex('users')
        .join('roles', 'users.role_id', 'roles.id')
        .select(
          'roles.role_name',
          'users.has_paid',
          knex.raw('pgp_sym_decrypt(users.email::bytea, ?) as email', [
            process.env.PGPCRYPTO_KEY
          ])
        )
        .where('users.id', userId);

      const newToken = jwt.sign(
        {
          id: userId,
          role: updated.role_name,
          email: updated.email,
          has_paid: updated.has_paid
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // 🚨 This line ensures old cookies don’t linger
      res.clearCookie('token');

      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 60 * 60 * 1000
      });

      return res.json({ message: 'Profile updated + token refreshed' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.publicSignup = async (req, res) => {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    phone,
    gender = ''
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔍 Look up UUID of 'patient' role
    const [{ id: roleId }] = await knex('roles')
      .select('id')
      .where({ role_name: 'Patient' }) // or your default role name
      .limit(1);

    if (!roleId) {
      return res.status(400).json({ error: 'Default role not found' });
    }

    const result = await knex('users')
      .returning('id')
      .insert({
        password: hashedPassword,
        role_id: roleId,
        member_since: knex.fn.now(),
        is_active: true,
        is_deleted: false,
        has_paid: false,
        date_created: knex.fn.now(),
        date_last_modified: knex.fn.now(),
        username: knex.raw('pgp_sym_encrypt(?, ?)', [
          username,
          process.env.PGPCRYPTO_KEY
        ]),
        email: knex.raw('pgp_sym_encrypt(?, ?)', [
          email,
          process.env.PGPCRYPTO_KEY
        ]),
        first_name: knex.raw('pgp_sym_encrypt(?, ?)', [
          first_name,
          process.env.PGPCRYPTO_KEY
        ]),
        last_name: knex.raw('pgp_sym_encrypt(?, ?)', [
          last_name,
          process.env.PGPCRYPTO_KEY
        ]),
        phone: knex.raw('pgp_sym_encrypt(?, ?)', [
          phone,
          process.env.PGPCRYPTO_KEY
        ]),
        gender: knex.raw('pgp_sym_encrypt(?, ?)', [
          gender,
          process.env.PGPCRYPTO_KEY
        ])
      });

    await knex('audit_log').insert({
      user_id: result[0].id,
      action: 'SELF_SIGNUP',
      description: `New public signup: ${username}`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Signup failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetPasswordViaToken = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find all unexpired reset entries
    const resets = await knex('password_resets').where(
      'expires_at',
      '>',
      new Date()
    );

    let matchedReset = null;

    for (const entry of resets) {
      const match = await bcrypt.compare(token, entry.token_hash);
      if (match) {
        matchedReset = entry;
        break;
      }
    }

    if (!matchedReset) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await knex('users').where({ id: matchedReset.user_id }).update({
      password: hashedPassword,
      date_last_modified: knex.fn.now()
    });

    await knex('audit_log').insert({
      user_id: matchedReset.user_id,
      action: 'SELF_PASSWORD_RESET',
      description: 'User reset their password using token link',
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    await knex('password_resets')
      .where('token_hash', matchedReset.token_hash)
      .del();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('❌ Reset password via token error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.hardDeleteUser = async (req, res) => {
  const decoded = req.user;
  const userId = req.params.id;

  try {
    if (decoded.role !== 'SuperAdmin') {
      return res.status(403).json({ error: 'Access denied: SuperAdmins only' });
    }

    // Double-check: Don't allow deletion of another SuperAdmin
    const [targetUser] = await knex('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select('users.id', 'roles.role_name')
      .where('users.id', userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.role_name === 'SuperAdmin') {
      return res
        .status(403)
        .json({ error: 'Cannot delete another SuperAdmin' });
    }

    await knex('users').where({ id: userId }).del();

    await knex('audit_log').insert({
      user_id: decoded.id,
      action: 'HARD_DELETE_USER',
      description: `SuperAdmin permanently deleted user ${userId}`,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: knex.fn.now()
    });

    res.status(200).json({ message: 'User hard-deleted successfully' });
  } catch (err) {
    console.error('❌ Hard delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
