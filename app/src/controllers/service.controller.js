const { Op } = require('sequelize');
const Service = require('../models/Service');
const { successRes, errorRes } = require('../utils/response');

// GET /services - publik, dengan pagination & filter
const getServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { is_active: true };
    if (search) where.title = { [Op.iLike]: `%${search}%` };
    if (category) where.category = category;

    const { count, rows } = await Service.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    return successRes(res, 200, 'Daftar layanan', rows, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// GET /services/:id - publik
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return errorRes(res, 404, 'Layanan tidak ditemukan');
    return successRes(res, 200, 'Detail layanan', service);
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// POST /services - admin only
const createService = async (req, res) => {
  try {
    const { title, description, category, operational_hours, contact } = req.body;
    if (!title) return errorRes(res, 400, 'Validasi gagal', [{ field: 'title', message: 'Judul wajib diisi' }]);

    const service = await Service.create({ title, description, category, operational_hours, contact });
    return successRes(res, 201, 'Layanan berhasil dibuat', service);
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// PUT /services/:id - admin only
const updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return errorRes(res, 404, 'Layanan tidak ditemukan');

    const { title, description, category, operational_hours, contact, is_active } = req.body;
    await service.update({ title, description, category, operational_hours, contact, is_active });
    return successRes(res, 200, 'Layanan berhasil diperbarui', service);
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

// DELETE /services/:id - admin only
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return errorRes(res, 404, 'Layanan tidak ditemukan');

    await service.destroy();
    return successRes(res, 200, 'Layanan berhasil dihapus');
  } catch (err) {
    return errorRes(res, 500, 'Server error', err.message);
  }
};

module.exports = { getServices, getServiceById, createService, updateService, deleteService };
