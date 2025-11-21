const express = require("express");
const router = express.Router();

const {
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  deleteAllPortfolios,
  getPublishedPortfolios,
  getPortfolios,
} = require("../Controller/portfolioController");

const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add",  addPortfolio);
router.get("/userportfolio",  getPublishedPortfolios);
router.get("/list",  getPortfolios);
router.put("/update/:id",  updatePortfolio);
router.delete("/delete/:id",  deletePortfolio);
router.delete("/delete-many",  deleteAllPortfolios);


module.exports = router;
