const express = require("express");
const router = express.Router();

const {
  createSubService,
  updateSubService,
  listserviceAdmin,
  getServiceById,
  deleteAllservices,
  getServiceBySlug,
  getservicesSlugs,
  listservice,
} = require("../Controller/subservicesController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/create", createSubService);
router.put("/update/:id", updateSubService);
router.get("/get/:id", getServiceById);
router.get("/listbyadmin", listserviceAdmin);
router.get("/list", listservice);
router.delete("/delete-many", deleteAllservices);
router.get('/view/:slug', getServiceBySlug);
router.get('/slugs', getservicesSlugs);
module.exports = router;
