const express = require("express");
const router = express.Router();

const { incrementImpression, getImpressionStats } = require("../Controller/viewController");
const authMiddleware = require("../Middleware/authMiddleware");



router.post('/count', incrementImpression);
router.get('/get/count',authMiddleware, getImpressionStats);

module.exports = router;