const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const ctrl = require('../controllers/coverLettersController');

router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
