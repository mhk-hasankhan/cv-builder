const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyzeMatch } = require('../controllers/jobMatchController');

router.post('/', auth, analyzeMatch);

module.exports = router;
