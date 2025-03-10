const express = require("express");
const router = express.Router();

const { incrementImpression, getImpressionStats } = require("../Controller/viewController");



router.post('/count', incrementImpression);
router.get('/get/count', getImpressionStats);

module.exports = router;