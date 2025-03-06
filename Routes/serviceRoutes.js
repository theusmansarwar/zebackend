const express = require("express");
const { deleteService, deleteMultipleServices, updateService, getServiceById, getAllLiveServices, getAllServices, createService, getServiceBySlug, addservice, updateSubService ,deleteMultiplesubServices} = require("../Controller/serviceController");
const router = express.Router();


router.post("/create", createService);      // Create a new service
router.get("/view", getAllServices); 
router.get("/live", getAllLiveServices);      // Get all services
router.get("/view/:id", getServiceById);  

router.get("/view/:slug", getServiceBySlug);
router.put("/update/:id", updateService);    // Update a service
router.delete("/delete/:id", deleteService); 
router.delete("/delete/serviceId", deleteMultipleServices); 
router.post("/subdata/add", addservice);
router.put("/subdata/update", updateSubService);
router.delete("/subdata/delete", deleteMultiplesubServices); 
module.exports = router;
