const express = require("express");
const router = express.Router();
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  deleteMultipleServices,
  getAllLiveServices
} = require("../Controllers/servicesController");

router.post("/create", createService);      // Create a new service
router.get("/view", getAllServices); 
router.get("/live", getAllLiveServices);      // Get all services
router.get("/view/:id", getServiceById);   // Get a single service by ID
router.put("/update/:id", updateService);    // Update a service
router.delete("/delete/:id", deleteService); 
router.delete("/delete", deleteService); 

module.exports = router;
