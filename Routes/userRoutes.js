const express = require("express");
const router = express.Router();

const { CreateLeads, LeadsList, GetLeadById, DeleteLeads } = require("../Controller/leadsController");
const authMiddleware = require("../Middleware/authMiddleware");



router.post('/CreateLeads', CreateLeads);
router.get('/LeadsList',LeadsList );
router.delete('/leadsDelete',DeleteLeads );
router.get('/Lead/:id',GetLeadById );

module.exports = router;