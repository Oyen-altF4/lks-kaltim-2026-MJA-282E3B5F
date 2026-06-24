const sequelize = require('../config/database');
const { Op } = require('sequelize');
const User = require('../models/User');
const Report = require('../models/Report');
const { successRes, errorRes } = require('../utils/response');

// GET /admin/dashboard - statistik ringkasan
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      rejectedReports,
      todayReports,
    ] = await Promise.all([
      User.count({ where: { role: 'citizen' } }),
      Report.count(),
      Report.count({ where: { status: 'pending' } }),
      Report.count({ where: { status: 'in_progress' } }),
      Report.count({ where: { status: 'resolved' } }),
      Report.count({ where: { status: 'rejected' } }),
      Report.count({ where: { created_at: { [Op.gte]: today } } }),
    ]);

    return successRes(res, 200, 'Data dashboard', {
      users: { total_citizens: totalUsers },
      reports: {
        total: totalReports,
        today: todayReports,
        by_status: {
          pending: pendingReports,
          in_progress: inProgressReports,
          resolved: resolvedReports,
          rejected: rejectedReports,
        },
      },
    });
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// GET /admin/users - daftar semua pengguna dengan pagination
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    return successRes(res, 200, 'Daftar pengguna', rows, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// PATCH /admin/users/:id/role - ubah role pengguna
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) return errorRes(res, 400, 'Validasi gagal', [{ field: 'role', message: 'Role wajib diisi' }]);
    if (!['admin', 'citizen'].includes(role)) {
      return errorRes(res, 400, 'Role tidak valid. Gunakan: admin atau citizen');
    }

    // Admin tidak bisa ubah role dirinya sendiri
    if (req.params.id === req.user.userId) {
      return errorRes(res, 403, 'Tidak dapat mengubah role akun sendiri');
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return errorRes(res, 404, 'Pengguna tidak ditemukan');

    await user.update({ role });
    return successRes(res, 200, 'Role pengguna berhasil diperbarui', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

module.exports = { getDashboard, getUsers, updateUserRole };
