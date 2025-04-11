const express = require("express");
const { deleteService, deleteMultipleServices, updatePrice,
    deleteMultiplePrice , updateService, getServiceById, getAllLiveServices, getAllServices, createService, getServiceBySlug, addservice, updateSubService , deleteMultipleSubServices,addprocess,updateProcess,deleteMultipleProcess,addbenifit,updateBenifit,deleteMultipleBenifits, getAllLiveServicesName, addprice,
    getAllLiveServicesNamehavingprice} = require("../Controller/serviceController");
const authMiddleware = require("../Middleware/authMiddleware");
const router = express.Router();


router.post("/create",authMiddleware, createService);  
router.get("/view",authMiddleware, getAllServices); 
router.get("/live", getAllLiveServices);  
router.get("/list",authMiddleware, getAllLiveServicesName); 
router.get("/plist",authMiddleware, getAllLiveServicesNamehavingprice); 
router.get("/view/:id",authMiddleware, getServiceById);  
 
router.get("/viewbyslug/:slug", getServiceBySlug);
router.put("/update/:id", authMiddleware,updateService);
router.delete("/delete/:id",authMiddleware, deleteService); 
router.delete("/delete", authMiddleware,deleteMultipleServices); 
router.post("/subdata/add",authMiddleware, addservice);
router.put("/subdata/update",authMiddleware, updateSubService);
router.delete("/subdata/delete/:subid",authMiddleware, deleteMultipleSubServices); 
router.post("/benifit/add",authMiddleware, addbenifit);
router.put("/benifit/update",authMiddleware, updateBenifit);
router.delete("/benifit/delete/:subid",authMiddleware, deleteMultipleBenifits); 
router.post("/process/add",authMiddleware, addprocess);
router.put("/process/update",authMiddleware, updateProcess);
router.delete("/process/delete/:subid",authMiddleware, deleteMultipleProcess); 
router.post("/pricing/add",authMiddleware, addprice); 
router.put("/pricing/update",authMiddleware, updatePrice);
router.delete("/pricing/delete",authMiddleware, deleteMultiplePrice); 
module.exports = router;
