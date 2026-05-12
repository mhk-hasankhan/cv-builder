const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/exportController');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.get('/pdf/:id', ctrl.exportPdf);
router.get('/docx/:id', ctrl.exportDocx);
router.get('/cover-letter/pdf/:id', ctrl.exportCoverLetterPdf);
router.get('/cover-letter/docx/:id', ctrl.exportCoverLetterDocx);

module.exports = router;
