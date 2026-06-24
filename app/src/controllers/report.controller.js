const { Op } = require('sequelize');
const Report = require('../models/Report');
const User = require('../models/User');
const { createNotification } = require('../utils/notification.helper');
const { successRes, errorRes } = require('../utils/response');

const VALID_STATUSES = ['pending', 'in_progress', 'resolved', 'rejected'];

// POST /reports - citizen & admin
const createReport = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    const errors = [];
    if (!title) errors.push({ field: 'title', message: 'Judul wajib diisi' });
    if (!description) errors.push({ field: 'description', message: 'Deskripsi wajib diisi' });
    if (errors.length > 0) return errorRes(res, 400, 'Validasi gagal', errors);

    const report = await Report.create({
      user_id: req.user.userId,
      title,
      description,
      category,
      location,
    });

    return successRes(res, 201, 'Laporan berhasil dikirim', report);
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// GET /reports - citizen (milik sendiri), admin (semua)
const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (req.user.role === 'citizen') where.user_id = req.user.userId;
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return errorRes(res, 400, 'Status tidak valid. Gunakan: ' + VALID_STATUSES.join(', '));
      }
      where.status = status;
    }
    if (category) where.category = category;

    const { count, rows } = await Report.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }],
    });

    return successRes(res, 200, 'Daftar laporan', rows, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// GET /reports/:id
const getReportById = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }],
    });
    if (!report) return errorRes(res, 404, 'Laporan tidak ditemukan');

    // Citizen hanya bisa akses miliknya
    if (req.user.role === 'citizen' && report.user_id !== req.user.userId) {
      return errorRes(res, 403, 'Akses ditolak. Ini bukan laporan Anda.');
    }

    return successRes(res, 200, 'Detail laporan', report);
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// PATCH /reports/:id/status - admin only
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) return errorRes(res, 400, 'Validasi gagal', [{ field: 'status', message: 'Status wajib diisi' }]);
    if (!VALID_STATUSES.includes(status)) {
      return errorRes(res, 400, 'Status tidak valid. Gunakan: ' + VALID_STATUSES.join(', '));
    }

    const report = await Report.findByPk(req.params.id);
    if (!report) return errorRes(res, 404, 'Laporan tidak ditemukan');

    const oldStatus = report.status;
    await report.update({ status, updated_by: req.user.userId });

    // Kirim notifikasi ke pelapor
    await createNotification(
      report.user_id,
      `Status laporan "${report.title}" diperbarui dari "${oldStatus}" menjadi "${status}"`,
      'report_update'
    );

    return successRes(res, 200, 'Status laporan berhasil diperbarui', report);
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

module.exports = { createReport, getReports, getReportById, updateStatus };
