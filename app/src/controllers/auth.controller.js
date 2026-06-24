const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successRes, errorRes } = require('../utils/response');

// POST /auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi field wajib
    const missing = [];
    if (!name) missing.push({ field: 'name', message: 'Nama wajib diisi' });
    if (!email) missing.push({ field: 'email', message: 'Email wajib diisi' });
    if (!password) missing.push({ field: 'password', message: 'Password wajib diisi' });
    if (missing.length > 0) return errorRes(res, 400, 'Validasi gagal', missing);

    // Validasi panjang password
    if (password.length < 6) {
      return errorRes(res, 400, 'Validasi gagal', [
        { field: 'password', message: 'Password minimal 6 karakter' },
      ]);
    }

    // Cek duplikat email
    const exist = await User.findOne({ where: { email } });
    if (exist) return errorRes(res, 409, 'Email sudah digunakan');

    // Hash password dan simpan
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    return successRes(res, 201, 'Registrasi berhasil', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(e => ({ field: e.path, message: e.message }));
      return errorRes(res, 400, 'Validasi gagal', errors);
    }
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorRes(res, 400, 'Validasi gagal', [
        { field: 'email', message: 'Email wajib diisi' },
        { field: 'password', message: 'Password wajib diisi' },
      ]);
    }

    // Cari user
    const user = await User.findOne({ where: { email } });
    if (!user) return errorRes(res, 401, 'Email atau password salah');

    // Verifikasi password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return errorRes(res, 401, 'Email atau password salah');

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return successRes(res, 200, 'Login berhasil', {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

module.exports = { register, login };
