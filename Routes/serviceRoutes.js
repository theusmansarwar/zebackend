const express = require("express");
const { deleteService, deleteMultipleServices, updatePrice,
    deleteMultiplePrice , updateService, getServiceById, getAllLiveServices, getAllServices, createService, getServiceBySlug, addservice, updateSubService , deleteMultipleSubServices,addprocess,updateProcess,deleteMultipleProcess,addbenifit,updateBenifit,deleteMultipleBenifits, getAllLiveServicesName, addprice,
    getAllLiveServicesNamehavingprice} = require("../Controller/serviceController");
const authMiddleware = require("../Middleware/authMiddleware");
const router = express.Router();


router.post("/create", createService);  
router.get("/view", getAllServices); 
router.get("/live", getAllLiveServices);  
router.get("/list", getAllLiveServicesName); 
router.get("/plist", getAllLiveServicesNamehavingprice); 
router.get("/view/:id", getServiceById);  
 
router.get("/viewbyslug/:slug", getServiceBySlug);
router.put("/update/:id", updateService);
router.delete("/delete/:id", deleteService); 
router.delete("/delete", deleteMultipleServices); 
router.post("/subdata/add", addservice);
router.put("/subdata/update", updateSubService);
router.delete("/subdata/delete/:subid", deleteMultipleSubServices); 
router.post("/benifit/add", addbenifit);
router.put("/benifit/update", updateBenifit);
router.delete("/benifit/delete/:subid", deleteMultipleBenifits); 
router.post("/process/add", addprocess);
router.put("/process/update", updateProcess);
router.delete("/process/delete/:subid", deleteMultipleProcess); 
router.post("/pricing/add", addprice); 
router.put("/pricing/update", updatePrice);
router.delete("/pricing/delete", deleteMultiplePrice); 
module.exports = router;
