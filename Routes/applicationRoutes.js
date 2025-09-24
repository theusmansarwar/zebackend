const express = require("express");
const router = express.Router();

const { CreateApplication, ApplicationList, GetApplicationById, DeleteApplication } = require("../Controller/applicationsController");
const authMiddleware = require("../Middleware/authMiddleware");



router.post('/CreateApplication', CreateApplication);
router.get('/ApplicationList',ApplicationList );
router.delete('/ApplicationDelete',DeleteApplication );
router.get('/Application/:id',GetApplicationById );

module.exports = router;