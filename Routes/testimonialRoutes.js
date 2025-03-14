const express = require("express");
const router = express.Router();

const {
    addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  deleteAllTestimonial,
  viewTestimonial,
  liveTestimonial,
  viewTestimonialById,
} = require("../Controller/testimonialController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add",authMiddleware, addTestimonial);
router.put("/update/:id",authMiddleware, updateTestimonial);
router.get("/live",liveTestimonial)
router.get("/view",authMiddleware,viewTestimonial)
router.get("/view/:id",authMiddleware,viewTestimonialById)
router.delete("/delete",authMiddleware,deleteAllTestimonial)
router.get("/delete/:id",authMiddleware,deleteTestimonial)


module.exports = router;
