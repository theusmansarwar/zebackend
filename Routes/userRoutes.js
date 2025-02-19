const express = require("express");
const router = express.Router();

const { CreateLeads } = require("../Controller/leadsController");



router.post('/CreateLeads', CreateLeads);

module.exports = router;