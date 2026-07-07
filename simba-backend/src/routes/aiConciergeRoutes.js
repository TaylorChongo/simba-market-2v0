const express = require('express');
const router = express.Router();
const aiConciergeController = require('../controllers/aiConciergeController');

router.post('/', aiConciergeController.concierge);

module.exports = router;
