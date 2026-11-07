const express = require('express');
const { getProfile, updateProfile, updatePassword } = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', updatePassword);

module.exports = router;
