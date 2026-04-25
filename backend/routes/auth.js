const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

router.post('/google', ctrl.googleSignIn);

module.exports = router;
