const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/service.controller');

router.get('/', ctrl.getServices);                                           // publik
router.get('/:id', ctrl.getServiceById);                                     // publik
router.post('/', verifyToken, requireRole(['admin']), ctrl.createService);   // admin
router.put('/:id', verifyToken, requireRole(['admin']), ctrl.updateService); // admin
router.delete('/:id', verifyToken, requireRole(['admin']), ctrl.deleteService); // admin

module.exports = router;
