const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/notification.controller');

router.get('/', verifyToken, ctrl.getNotifications);
router.patch('/read-all', verifyToken, ctrl.markAllAsRead);
router.patch('/:id/read', verifyToken, ctrl.markAsRead);

module.exports = router;
