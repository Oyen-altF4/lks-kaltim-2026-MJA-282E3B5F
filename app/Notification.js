/**
 * Middleware: batasi akses berdasarkan role
 * Gunakan setelah verifyToken
 * Contoh: requireRole(['admin'])
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Tidak terautentikasi' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Hanya ${allowedRoles.join('/')} yang diizinkan.`,
      });
    }
    next();
  };
};

module.exports = { requireRole };
