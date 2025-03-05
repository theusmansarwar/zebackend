const Service = require("../Models/serviceModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
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

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};



const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter 
}).fields([
  { name: "image", maxCount: 1 },       // Main image
  { name: "icons", maxCount: 10 },      // Icons for services/process
  { name: "images", maxCount: 10 }      // Images for benefits
]);

const createService = async (req, res) => {
  try {
    const { name, introduction, slug, services, benefits, process, pricing, pricingPublished } = req.body;

    // File uploads
    const image = req.files.image ? `/uploads/${req.files.image[0].filename}` : null;
    
    // Map file names to respective JSON objects
    const icons = req.files.icons ? req.files.icons.map(file => `/uploads/${file.filename}`) : [];
    const images = req.files.images ? req.files.images.map(file => `/uploads/${file.filename}`) : [];

    // Convert JSON strings from frontend
    const parsedServices = services ? JSON.parse(services) : [];
    const parsedBenefits = benefits ? JSON.parse(benefits) : [];
    const parsedProcess = process ? JSON.parse(process) : [];
    const parsedPricing = pricingPublished === "true" && pricing ? JSON.parse(pricing) : [];

    // Assign uploaded file names to service/process/benefit objects
    parsedServices.forEach((service, index) => {
      service.icon = icons[index] || null;
    });

    parsedBenefits.forEach((benefit, index) => {
      benefit.img = images[index] || null;
    });

    parsedProcess.forEach((step, index) => {
      step.icon = icons[index] || null;
    });

    const newService = new Service({
      name,
      introduction,
      slug,
      image,
      services: parsedServices,
      benefits: parsedBenefits,
      process: parsedProcess,
      pricing: parsedPricing, 
    });

    await newService.save();

    res.status(201).json({
      status: 201,
      message: "Service created successfully!",
      service: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  createService: [upload, createService], // Use upload.fields()
};
