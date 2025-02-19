const Leads = require("../Models/leadsModel");
const sendEmailToCompany = require("./emailverification");
const CreateLeads = async (req, res) => {
  const { name, email, phone, subject, query } = req.body;

  const missingFields = [];
  if (!name) missingFields.push("name");
  if (!email) missingFields.push("email");
  if (!phone) missingFields.push("phone");
  if (!subject) missingFields.push("subject");
  if (!query) missingFields.push("query");

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: 400,
      message: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }
  
  // Check if email is valid
  if (!email.includes("@")) {
    return res.status(400).json({
      status: 400,
      message: "heeeeeyyyyyyyyy Invalid email format. Email must contain '@'.",
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
      message: "Lead Created Successfully",
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
};
