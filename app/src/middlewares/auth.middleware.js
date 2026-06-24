const jwt = require('jsonwebtoken');

/**
 * Middleware: verifikasi JWT dari header Authorization
 */
const verifyToken = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan. Sertakan Authorization: Bearer <token>' });
  }

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Token kadaluarsa, silakan login kembali'
      : 'Token tidak valid';
    return res.status(401).json({ success: false, message: msg });
  }
};

module.exports = { verifyToken };
