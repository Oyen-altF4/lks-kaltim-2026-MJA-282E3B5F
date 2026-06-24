const Notification = require('../models/Notification');

/**
 * Buat notifikasi untuk user tertentu
 * @param {string} userId - UUID penerima
 * @param {string} message - Isi pesan
 * @param {string} type - Tipe notifikasi (report_update, system, dsb.)
 */
const createNotification = async (userId, message, type = 'system') => {
  try {
    await Notification.create({ user_id: userId, message, type });
  } catch (err) {
    console.error('[Notification Error]', err.message);
  }
};

module.exports = { createNotification };
