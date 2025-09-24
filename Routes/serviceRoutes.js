const express = require("express");
const router = express.Router();

const {
  createservice,
  updateService,
  listserviceAdmin,
  getServiceById,
  deleteAllservices,
  getServiceBySlug,
  getservicesSlugs,
  listservice,
  
 
} = require("../Controller/serviceController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/create", createservice);
router.put("/update/:id", updateService);
router.get("/get/:id", getServiceById);
router.get("/listbyadmin", listserviceAdmin);
router.get("/list", listservice);
router.delete("/delete-many", deleteAllservices);
router.get('/view/:slug', getServiceBySlug);
router.get('/slugs', getservicesSlugs);
module.exports = router;
