const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/admin.controller');

router.get('/dashboard', verifyToken, requireRole(['admin']), ctrl.getDashboard);
router.get('/users', verifyToken, requireRole(['admin']), ctrl.getUsers);
router.patch('/users/:id/role', verifyToken, requireRole(['admin']), ctrl.updateUserRole);

module.exports = router;
