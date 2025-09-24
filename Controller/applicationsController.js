const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require("../Models/applicationModel"); // Ensure this path is correct
const sendEmailToCompany = require("./emailverification");

// Directory to store uploaded files
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter to allow only images (for thumbnail) and pdf/docx (for resume)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") || 
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files and resumes (PDF/DOC/DOCX) are allowed!"), false);
  }
};

// Multer Upload Middleware for multiple files
const upload = multer({ storage: storage, fileFilter: fileFilter }).fields([
  { name: 'resume', maxCount: 1 }, // for the resume file
]);

// Create Application Controller
const CreateApplication = async (req, res) => {
  const { name,lastName, email, phone, jobTitle } = req.body;
  const resume = req.files ? req.files['resume'] : null; // For resume file (PDF, DOC, DOCX)
  
  

  const missingFields = [];

  // Check for missing required fields
  if (!name) missingFields.push({ name: "name", message: "Name field is required" });
  if (!lastName) missingFields.push({ name: "lastName", message: "LastName field is required" });
  if (!email) {
    missingFields.push({ name: "email", message: "Email field is required" });
  } else if (!email.includes("@")) {
    missingFields.push({ name: "email", message: "Email must contain @" });
  }
  if (!phone) missingFields.push({ name: "phone", message: "Phone field is required" });
  else if (phone.trim().length < 6) {
    missingFields.push({ name: "phone", message: "Phone is incomplete" });
  }
  if (!jobTitle) missingFields.push({ name: "jobTitle", message: "Job Title field is required" });
  if (!resume) missingFields.push({ name: "resume", message: "Resume file is required" });

  // If there are missing fields, return a 400 response
  if (missingFields.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Some fields are missing!",
      missingFields,
    });
  }
const fullname=`${name} ${fullname}`;
  try {
    // Save the application to the database
    const ApplicationCreated = await Application.create({
      name: fullname,
      email,
      phone,
      jobTitle,

      resume: resume ? `/uploads/${resume[0].filename}` : null, // Save path for resume
    });

    return res.status(201).json({
      status: 201,
      message: "Application submitted successfully",
      ApplicationCreated,
    });
  } catch (err) {
    console.error("Error creating application:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Application List Controller
const ApplicationList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalApplication = await Application.countDocuments();

    const applications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return res.status(200).json({
      status: 200,
      message: "Applications fetched successfully",
      applications:applications,
      totalApplication,
      totalPages: Math.ceil(totalApplication / limit), 
      currentPage: page,
      limit:limit,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Get Application by ID Controller
const GetApplicationById = async (req, res) => {
  try {
    const { id } = req.params; 

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        status: 404,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Application fetched successfully",
      application,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Delete Application Controller
const DeleteApplication = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({status: 400, message: "Invalid request. Provide Application IDs." });
    }

    // Check if Application exists before deleting
    const existingApplications = await Application.find({ _id: { $in: ids } });

    if (existingApplications.length === 0) {
      return res.status(404).json({status: 400, message: "No Application found with the given IDs." });
    }

    // Delete Application
    await Application.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "Application deleted successfully.",
      deletedApplications: ids
    });

  } catch (error) {
    console.error("Error deleting Application:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Export Controllers
module.exports = {
  CreateApplication: [upload, CreateApplication],
  ApplicationList,
  GetApplicationById,
  DeleteApplication
};
