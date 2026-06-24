const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/report.controller');

router.post('/', verifyToken, ctrl.createReport);                                        // citizen & admin
router.get('/', verifyToken, ctrl.getReports);                                           // citizen (own) & admin (all)
router.get('/:id', verifyToken, ctrl.getReportById);                                     // citizen (own) & admin
router.patch('/:id/status', verifyToken, requireRole(['admin']), ctrl.updateStatus);     // admin only

module.exports = router;
