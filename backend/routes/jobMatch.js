const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyzeMatch, listMatches, deleteMatch } = require('../controllers/jobMatchController');

router.post('/', auth, analyzeMatch);
router.get('/', auth, listMatches);
router.delete('/:id', auth, deleteMatch);

module.exports = router;
