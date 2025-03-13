const express = require("express");
const router = express.Router();

const { CreateLeads, LeadsList, GetLeadById, DeleteLeads } = require("../Controller/leadsController");
const authMiddleware = require("../Middleware/authMiddleware");



router.post('/CreateLeads', CreateLeads);
router.get('/LeadsList',authMiddleware,LeadsList );
router.delete('/leadsDelete',authMiddleware,DeleteLeads );
router.get('/Lead/:id',authMiddleware,GetLeadById );

module.exports = router;