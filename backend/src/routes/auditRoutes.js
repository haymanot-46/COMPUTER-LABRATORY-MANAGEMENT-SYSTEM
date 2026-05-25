const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auditController');

router.get('/', ctrl.getAudits);
router.get('/:id', ctrl.getAuditById);
router.post('/', ctrl.createAudit);

module.exports = router;
