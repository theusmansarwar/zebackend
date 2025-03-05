const express = require("express");
const { deleteService, deleteMultipleServices, updateService, getServiceById, getAllLiveServices, getAllServices, createService } = require("../Controller/serviceController");
const router = express.Router();


router.post("/create", createService);      // Create a new service
router.get("/view", getAllServices); 
router.get("/live", getAllLiveServices);      // Get all services
router.get("/view/:id", getServiceById);   // Get a single service by ID
router.put("/update/:id", updateService);    // Update a service
router.delete("/delete/:id", deleteService); 
router.delete("/delete", deleteMultipleServices); 

module.exports = router;
