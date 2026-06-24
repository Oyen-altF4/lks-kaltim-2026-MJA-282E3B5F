const Notification = require('../models/Notification');
const { successRes, errorRes } = require('../utils/response');

// GET /notifications - ambil notifikasi milik user yang login
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, read } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { user_id: req.user.userId };
    if (read === 'false') where.is_read = false;
    if (read === 'true') where.is_read = true;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    const unreadCount = await Notification.count({
      where: { user_id: req.user.userId, is_read: false },
    });

    return successRes(res, 200, 'Daftar notifikasi', rows, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      unread: unreadCount,
    });
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// PATCH /notifications/:id/read - tandai sudah dibaca
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return errorRes(res, 404, 'Notifikasi tidak ditemukan');

    if (notif.user_id !== req.user.userId) {
      return errorRes(res, 403, 'Akses ditolak. Ini bukan notifikasi Anda.');
    }

    await notif.update({ is_read: true });
    return successRes(res, 200, 'Notifikasi ditandai sudah dibaca', notif);
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// PATCH /notifications/read-all - tandai semua sudah dibaca
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.userId, is_read: false } }
    );
    return successRes(res, 200, 'Semua notifikasi ditandai sudah dibaca');
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
