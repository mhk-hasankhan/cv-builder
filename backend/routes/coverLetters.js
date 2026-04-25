const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const requireAuth = require('../middleware/auth');
const ctrl = require('../controllers/coverLettersController');

router.use(requireAuth);

=======
const ctrl = require('../controllers/coverLettersController');

>>>>>>> 1e0424acaade213ab31886d5ec68cede14bf7c9d
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
