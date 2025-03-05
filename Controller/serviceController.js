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

// Multer Upload Middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

const createService = async (req, res) => {
  try {
    const { name, introduction, slug, services, benefits, process, pricing, pricingPublished } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Convert JSON strings (if sent from frontend)
    const parsedServices = services ? JSON.parse(services) : [];
    const parsedBenefits = benefits ? JSON.parse(benefits) : [];
    const parsedProcess = process ? JSON.parse(process) : [];
    const parsedPricing = pricingPublished === "true" && pricing ? JSON.parse(pricing) : [];

    const missingFields = [];
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!introduction) missingFields.push({ name: "introduction", message: "Introduction is required" });
    if (!slug) missingFields.push({ name: "slug", message: "Slug is required" });
    if (!image) missingFields.push({ name: "image", message: "Image is required" });

    parsedServices.forEach((service, index) => {
      if (!service.icon) missingFields.push({ name: `services[${index}].icon`, message: "Icon is required" });
      if (!service.name) missingFields.push({ name: `services[${index}].name`, message: "Service name is required" });
      if (!service.description) missingFields.push({ name: `services[${index}].description`, message: "Description is required" });
    });

    parsedBenefits.forEach((benefit, index) => {
      if (!benefit.name) missingFields.push({ name: `benefits[${index}].name`, message: "Benefit name is required" });
      if (!benefit.img) missingFields.push({ name: `benefits[${index}].img`, message: "Benefit image is required" });
      if (!benefit.description) missingFields.push({ name: `benefits[${index}].description`, message: "Description is required" });
    });

    parsedProcess.forEach((step, index) => {
      if (!step.icon) missingFields.push({ name: `process[${index}].icon`, message: "Process icon is required" });
      if (!step.title) missingFields.push({ name: `process[${index}].title`, message: "Process title is required" });
      if (!step.description) missingFields.push({ name: `process[${index}].description`, message: "Description is required" });
    });

    if (pricingPublished === "true") {
      parsedPricing.forEach((plan, index) => {
        if (!plan.name) missingFields.push({ name: `pricing[${index}].name`, message: "Pricing name is required" });
        if (!plan.price) missingFields.push({ name: `pricing[${index}].price`, message: "Price is required" });
        if (!plan.title) missingFields.push({ name: `pricing[${index}].title`, message: "Pricing title is required" });

        plan.services.forEach((service, sIndex) => {
          if (!service.name) missingFields.push({
            name: `pricing[${index}].services[${sIndex}].name`,
            message: "Service name is required in pricing"
          });
        });
      });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

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
  createService: [upload.single("image"), createService],
};
