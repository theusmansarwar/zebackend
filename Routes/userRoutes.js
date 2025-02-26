const express = require("express");
const router = express.Router();

const { CreateLeads, LeadsList, GetLeadById } = require("../Controller/leadsController");



router.post('/CreateLeads', CreateLeads);
router.get('/LeadsList',LeadsList );
router.get('/Lead/:id',GetLeadById );

module.exports = router;