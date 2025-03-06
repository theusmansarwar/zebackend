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
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
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
const upload = multer({ storage, fileFilter });

// 🟢 Create a Service
const createService = async (req, res) => {
  try {
    const { name, introduction, slug, published } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const missingFields = [];
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!introduction) missingFields.push({ name: "introduction", message: "Introduction is required" });
    if (!slug) missingFields.push({ name: "slug", message: "Slug is required" });
    if (!image) missingFields.push({ name: "image", message: "Image is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Some fields are missing!", missingFields });
    }

    // Create new service
    const newService = await Service.create({
      name,
      slug,
      introduction,
      image,
      published: published === "true" || published === true,
    });

    res.status(201).json({ status: 201, message: "Service created successfully", service: newService });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const addservice = async (req, res) => {
  try {
    const { title, description, published, id } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const missingFields = [];
    if (!title) missingFields.push({ name: "title", message: "Title is required" });
    if (!description) missingFields.push({ name: "description", message: "Description is required" });
    if (!image) missingFields.push({ name: "image", message: "Image is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Some fields are missing!", missingFields });
    }
    const service = await Service.findById(id); 
   console.log(service)
    service.services.push({
      image,
      title,
      description,
      published: published === "true" || published === true,
    });
    
    await service.save();
    

    res.status(201).json({ status: 201, message: "Service created successfully", service });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};





const updateSubService = async (req, res) => {
  try {
    const { serviceId, subServiceId, title, description, published } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ status: 404, message: "Service not found" });
    }

    const subService = service.services.id(subServiceId);
    if (!subService) {
      return res.status(404).json({ status: 404, message: "Sub-service not found" });
    }

    // Update fields if provided
    if (title) subService.title = title;
    if (description) subService.description = description;
    if (image) subService.image = image;
    if (published !== undefined) {
      subService.published = published === "true" || published === true;
    }

    await service.save();
    res.status(200).json({ status: 200, message: "Sub-service updated successfully", service });
  } catch (error) {
    console.error("Error updating sub-service:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

















// 🟢 Get All Services
const getAllServices = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Service.countDocuments(); 
    const services = await Service.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    res.status(200).json({
      status: 200,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getAllLiveServices = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Service.countDocuments({ published: true }); // Count only live services
    const services = await Service.find({ published: true })
      .select("-pricing -process -benefits -services -published")
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    res.status(200).json({
      status: 200,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      services,
    });
  } catch (error) {
    console.error("Error fetching live services:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// 🟢 Get a Single Service by ID
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ status: 404, message: "Service not found" });

    res.status(200).json({ status: 200, service });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const getServiceBySlug = async (req, res) => {
  try {
    const service = await Service.findOne({slug:req.params.slug});
    if (!service) return res.status(404).json({ status: 404, message: "Service not found" });

    res.status(200).json({ status: 200, service });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 🟢 Update a Service
const updateService = async (req, res) => {
  try {
    const { name, introduction, slug, published } = req.body;
    let updatedData = { name, introduction, slug, published: published === "true" || published === true };

    // Check if a new image is uploaded
    if (req.file) {
      const service = await Service.findById(req.params.id);
      if (!service) return res.status(404).json({ status: 404, message: "Service not found" });

      // Remove old image from server
      if (service.image) {
        const oldImagePath = path.join(__dirname, "..", service.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }

      updatedData.image = `/uploads/${req.file.filename}`;
    }

    const updatedService = await Service.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json({ status: 200, message: "Service updated successfully", service: updatedService });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ status: 404, message: "Service not found" });

    if (service.image) {
      const imagePath = path.join(__dirname, "..", service.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 200, message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const deleteMultipleServices = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of service IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 400, message: "Invalid request. Please provide an array of IDs." });
    }

    // Fetch all services to delete
    const services = await Service.find({ _id: { $in: ids } });

    if (!services.length) {
      return res.status(404).json({ status: 404, message: "No matching services found to delete." });
    }

    // Remove images from the server
    services.forEach(service => {
      if (service.image) {
        const imagePath = path.join(__dirname, "..", service.image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
    });

    // Delete services from database
    await Service.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ status: 200, message: "Selected services deleted successfully." });
  } catch (error) {
    console.error("Error deleting multiple services:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const deleteMultiplesubServices = async (req, res) => {
  try {
    const { serviceId } = req.params; // Get service ID from params
    const { ids } = req.body; // Get subservice IDs from body

    if (!serviceId) {
      return res.status(400).json({ status: 400, message: "Service ID is required." });
    }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 400, message: "Invalid request. Please provide an array of subservice IDs." });
    }

    // Find the service and its subservices
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ status: 404, message: "Service not found." });
    }

    // Find matching subservices in the service
    const subServicesToDelete = service.services.filter(sub => ids.includes(sub._id.toString()));
    
    if (!subServicesToDelete.length) {
      return res.status(404).json({ status: 404, message: "No matching subservices found to delete." });
    }

    // Remove images from the server
    subServicesToDelete.forEach(sub => {
      if (sub.image) {
        const imagePath = path.join(__dirname, "..", sub.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Delete the image
        }
      }
    });

    // Remove subservices from the array
    await Service.updateOne(
      { _id: serviceId },
      { $pull: { services: { _id: { $in: ids } } } }
    );

    res.status(200).json({ status: 200, message: "Selected subservices deleted successfully." });
  } catch (error) {
    console.error("Error deleting multiple subservices:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
// Export Controllers
module.exports = {
  createService: [upload.single("image"), createService],
  getAllServices,
  getServiceById,
  getServiceBySlug,
  updateService: [upload.single("image"), updateService],
  deleteService,
  deleteMultipleServices,
  getAllLiveServices,
  addservice: [upload.single("image"), addservice],
  updateSubService: [upload.single("image"), updateSubService],
  deleteMultiplesubServices
};
