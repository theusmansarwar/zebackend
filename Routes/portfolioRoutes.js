const express = require("express");
const router = express.Router();

const {
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  deleteAllPortfolios,
} = require("../Controller/portfolioController");

const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add",  addPortfolio);
router.put("/update/:id",  updatePortfolio);
router.delete("/delete/:id",  deletePortfolio);
router.delete("/delete-many",  deleteAllPortfolios);


module.exports = router;
