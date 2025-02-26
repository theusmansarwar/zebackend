const Leads = require("../Models/leadsModel");
const sendEmailToCompany = require("./emailverification");
const CreateLeads = async (req, res) => {
  const { name, email, phone, subject, query } = req.body;
  const missingFields = [];

  if (!name) missingFields.push({ name: "name", message: "Name field is required" });
  if (!email) {
    missingFields.push({ name: "email", message: "Email field is required" });
  } else if (!email.includes("@")) {
    missingFields.push({ name: "email", message: "Email must contain @" });
  }
  
  if (!phone) missingFields.push({ name: "phone", message: "Phone field is required" });
  else if (phone.trim().length < 6) {
    missingFields.push({ name: "phone", message: "Phone is incomplete" });
}

  if (!subject) missingFields.push({ name: "subject", message: "Subject field is required" });
  if (!query) missingFields.push({ name: "query", message: "Query field is required" });
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Some feilds are missing!",
      missingFields,
    });
  }
  
  

  

  try {
    const LeadsCreated = await Leads.create({
      name,
      email,
      phone,
      subject,
      query,
    });
    sendEmailToCompany({ email, name, subject, phone, query }, res);

    if (!LeadsCreated) {
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }

    return res.status(201).json({
      status: 201,
      message: "Request Sent Successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};
const LeadsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalLeads = await Leads.countDocuments();

    const leads = await Leads.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return res.status(200).json({
      status: 200,
      message: "Leads fetched successfully",
      leads,
      totalLeads,
      totalPages: Math.ceil(totalLeads / limit), // Fixed typo
      currentPage: page,
      limit,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const GetLeadById = async (req, res) => {
  try {
    const { id } = req.params; // Get lead ID from request parameters

    const lead = await Leads.findById(id);

    if (!lead) {
      return res.status(404).json({
        status: 404,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Lead fetched successfully",
      lead,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};


module.exports = {
  CreateLeads,
  LeadsList,
  GetLeadById
};
