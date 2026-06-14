const express = require('express');
const router = express.Router();
const { submitMessage } = require('../controllers/contactController');

router.post('/', submitMessage);

module.exports = router;
