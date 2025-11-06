const express = require("express");
const router = express.Router();

const {
  addProduct,
  updateProduct,
  viewProduct,
  liveProduct,
  deleteAllProducts,
  getProductById,
} = require("../Controller/productsController");

router.post("/add", addProduct);
router.put("/update/:id", updateProduct);
router.get("/get/:id", getProductById);
router.get("/view", viewProduct);
router.get("/live", liveProduct);
router.delete("/delete", deleteAllProducts);

module.exports = router;
