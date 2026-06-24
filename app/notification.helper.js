require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');

// Import models agar relasi terdaftar
require('./models/User');
require('./models/Service');
require('./models/Report');
require('./models/Notification');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// Routes
// ========================
app.use('/auth', require('./routes/auth.route'));
app.use('/services', require('./routes/service.route'));
app.use('/reports', require('./routes/report.route'));
app.use('/notifications', require('./routes/notification.route'));
app.use('/admin', require('./routes/admin.route'));

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API berjalan dengan baik', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} tidak ditemukan` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ========================
// Start server
// ========================
const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] Koneksi database berhasil');

    // sync({ alter: true }) akan menyesuaikan tabel yang sudah ada
    await sequelize.sync({ alter: true });
    console.log('[DB] Sinkronisasi model selesai');

    app.listen(PORT, () => {
      console.log(`[Server] Berjalan di http://localhost:${PORT}`);
      console.log('[Endpoint] POST   /auth/register');
      console.log('[Endpoint] POST   /auth/login');
      console.log('[Endpoint] GET    /services');
      console.log('[Endpoint] GET    /services/:id');
      console.log('[Endpoint] POST   /services        (admin)');
      console.log('[Endpoint] PUT    /services/:id    (admin)');
      console.log('[Endpoint] DELETE /services/:id    (admin)');
      console.log('[Endpoint] POST   /reports');
      console.log('[Endpoint] GET    /reports');
      console.log('[Endpoint] GET    /reports/:id');
      console.log('[Endpoint] PATCH  /reports/:id/status  (admin)');
      console.log('[Endpoint] GET    /notifications');
      console.log('[Endpoint] PATCH  /notifications/:id/read');
      console.log('[Endpoint] PATCH  /notifications/read-all');
      console.log('[Endpoint] GET    /admin/dashboard  (admin)');
      console.log('[Endpoint] GET    /admin/users      (admin)');
      console.log('[Endpoint] PATCH  /admin/users/:id/role (admin)');
    });
  } catch (err) {
    console.error('[Error] Gagal memulai server:', err.message);
    process.exit(1);
  }
};

start();
