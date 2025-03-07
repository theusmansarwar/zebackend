const Service = require("../Models/serviceModel");
const Pricing = require("../Models/pricingModel");
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
    const { name, introduction, slug, published,isPricing } = req.body;
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
      isPricing: isPricing === "true" || isPricing === true,
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
    service.subservices.push({
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

    const subService = service.subservices.id(subServiceId);
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
const deleteMultipleSubServices = async (req, res) => {
  try {
    const { subid } = req.params; // Get the parent service ID
    const { ids } = req.body; // Array of subservice IDs

    if (!subid) {
      return res.status(400).json({ status: 400, message: "Service ID is required." });
    }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 400, message: "Please provide an array of subservice IDs." });
    }

    // Find the parent service
    const service = await Service.findById(subid);
    if (!service) {
      return res.status(404).json({ status: 404, message: "Service not found." });
    }

    // Find and delete images of the subservices being removed
    service.subservices.forEach((subservice) => {
      if (ids.includes(subservice._id.toString()) && subservice.image) {
        const imagePath = path.join(__dirname, "..", subservice.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });

    // Remove subservices from the service's array
    const updatedService = await Service.findByIdAndUpdate(
      subid,
      { $pull: { subservices: { _id: { $in: ids } } } },
      { new: true }
    );

    res.status(200).json({
      status: 200,
      message: "Selected subservices deleted successfully.",
      updatedService,
    });
  } catch (error) {
    console.error("Error deleting multiple subservices:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const addbenifit = async (req, res) => {
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
    service.benefits.push({
      image,
      title,
      description,
      published: published === "true" || published === true,
    });
    
    await service.save();
    

    res.status(201).json({ status: 201, message: "Benefit created successfully", service });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const updateBenifit = async (req, res) => {
  try {
    const { serviceId, benifitId, title, description, published } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ status: 404, message: "Service not found" });
    }

    const benefit = service.benefits.id(benifitId);
    if (!benefit) {
      return res.status(404).json({ status: 404, message: "Benifit not found" });
    }

    // Update fields if provided
    if (title) benefit.title = title;
    if (description) benefit.description = description;
    if (image) benefit.image = image;
    if (published !== undefined) {
      benefit.published = published === "true" || published === true;
    }

    await service.save();
    res.status(200).json({ status: 200, message: "Benefits updated successfully", service });
  } catch (error) {
    console.error("Error updating benefits:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const deleteMultipleBenifits = async (req, res) => {
  try {
    const { subid } = req.params; // Get the parent service ID
    const { ids } = req.body; // Array of subservice IDs

    if (!subid) {
      return res.status(400).json({ status: 400, message: "Service ID is required." });
    }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 400, message: "Please provide an array of benefits IDs." });
    }

    // Find the parent service
    const service = await Service.findById(subid);
    if (!service) {
      return res.status(404).json({ status: 404, message: "Service not found." });
    }

    // Find and delete images of the subservices being removed
    service.benefits.forEach((benefit) => {
      if (ids.includes(benefit._id.toString()) && benefit.image) {
        const imagePath = path.join(__dirname, "..", benefit.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });

    // Remove subservices from the service's array
    const updatedService = await Service.findByIdAndUpdate(
      subid,
      { $pull: { benefits: { _id: { $in: ids } } } },
      { new: true }
    );

    res.status(200).json({
      status: 200,
      message: "Selected benefits deleted successfully.",
      updatedService,
    });
  } catch (error) {
    console.error("Error deleting multiple benefits:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const addprocess = async (req, res) => {
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
    service.process.push({
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
const updateProcess = async (req, res) => {
  try {
    const { serviceId, subServiceId, title, description, published } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ status: 404, message: "Service not found" });
    }

    const process = service.process.id(subServiceId);
    if (!process) {
      return res.status(404).json({ status: 404, message: "Sub-service not found" });
    }

    // Update fields if provided
    if (title) process.title = title;
    if (description) process.description = description;
    if (image) process.image = image;
    if (published !== undefined) {
      process.published = published === "true" || published === true;
    }

    await service.save();
    res.status(200).json({ status: 200, message: "Sub-service updated successfully", service });
  } catch (error) {
    console.error("Error updating sub-service:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const deleteMultipleProcess = async (req, res) => {
  try {
    const { subid } = req.params; // Get the parent service ID
    const { ids } = req.body; // Array of subservice IDs

    if (!subid) {
      return res.status(400).json({ status: 400, message: "Service ID is required." });
    }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 400, message: "Please provide an array of process IDs." });
    }

    // Find the parent service
    const service = await Service.findById(subid);
    if (!service) {
      return res.status(404).json({ status: 404, message: "Service not found." });
    }

    // Find and delete images of the subservices being removed
    service.process.forEach((process) => {
      if (ids.includes(process._id.toString()) && process.image) {
        const imagePath = path.join(__dirname, "..", process.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });

    // Remove subservices from the service's array
    const updatedService = await Service.findByIdAndUpdate(
      subid,
      { $pull: { process: { _id: { $in: ids } } } },
      { new: true }
    );

    res.status(200).json({
      status: 200,
      message: "Selected subservices deleted successfully.",
      updatedService    });
  } catch (error) {
    console.error("Error deleting multiple process:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


const addprice = async (req, res) => {
  try {
    const { name, price, validity, features, serviceId, published } = req.body;

    // 🔍 Validate required fields
    const missingFields = [];
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!price) missingFields.push({ name: "price", message: "Price is required" });
    if (!validity) missingFields.push({ name: "validity", message: "Validity is required" });
    if (!features || !Array.isArray(features)) {
      missingFields.push({ name: "features", message: "Features must be an array and is required" });
    }
    if (!serviceId) missingFields.push({ name: "serviceId", message: "serviceId is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    // 🔎 Check if the service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ status: 404, message: "Service not found!" });
    }

    // ✅ Create new Pricing
    const newPricing = new Pricing({
      name,
      price,
      validity,
      features,
      published: published || false, // Default to false if not provided
    });

    const savedPricing = await newPricing.save();

    // ✅ Link pricing ID to service
    await Service.findByIdAndUpdate(
      serviceId,
      { $push: { pricing: savedPricing._id } }, // Add pricing ID to service
      { new: true }
    );

    res.status(201).json({
      status: 201,
      message: "Pricing added successfully",
      pricing: savedPricing,
    });
  } catch (error) {
    console.error("Error adding pricing:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const updatePrice = async (req, res) => {
  try {
    const { serviceId, subServiceId, title, description, published } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ status: 404, message: "Service not found" });
    }

    const process = service.process.id(subServiceId);
    if (!process) {
      return res.status(404).json({ status: 404, message: "Sub-service not found" });
    }

    // Update fields if provided
    if (title) process.title = title;
    if (description) process.description = description;
    if (image) process.image = image;
    if (published !== undefined) {
      process.published = published === "true" || published === true;
    }

    await service.save();
    res.status(200).json({ status: 200, message: "Sub-service updated successfully", service });
  } catch (error) {
    console.error("Error updating sub-service:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const deleteMultiplePrice = async (req, res) => {
  try {
    const { subid } = req.params; // Get the parent service ID
    const { ids } = req.body; // Array of subservice IDs

    if (!subid) {
      return res.status(400).json({ status: 400, message: "Service ID is required." });
    }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 400, message: "Please provide an array of process IDs." });
    }

    // Find the parent service
    const service = await Service.findById(subid);
    if (!service) {
      return res.status(404).json({ status: 404, message: "Service not found." });
    }

    // Find and delete images of the subservices being removed
    service.process.forEach((process) => {
      if (ids.includes(process._id.toString()) && process.image) {
        const imagePath = path.join(__dirname, "..", process.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });

    // Remove subservices from the service's array
    const updatedService = await Service.findByIdAndUpdate(
      subid,
      { $pull: { process: { _id: { $in: ids } } } },
      { new: true }
    );

    res.status(200).json({
      status: 200,
      message: "Selected subservices deleted successfully.",
      updatedService    });
  } catch (error) {
    console.error("Error deleting multiple process:", error);
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
const getAllLiveServicesName = async (req, res) => {
  try {
   
    const services = await Service.find({ published: true })
      .select("name")
      

    res.status(200).json({
      status: 200,
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
    const service = await Service.findById(req.params.id).populate("Pricing");
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
    const { name, introduction, slug, published, isPricing } = req.body;
    let updatedData = { name, introduction, slug, published: published === "true" || published === true , isPricing: isPricing === "true" || isPricing === true };

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
  deleteMultipleSubServices,
  addbenifit: [upload.single("image"), addbenifit],
  updateBenifit: [upload.single("image"), updateBenifit],
  deleteMultipleBenifits,
  addprocess: [upload.single("image"), addprocess],
  updateProcess: [upload.single("image"), updateProcess],
  deleteMultipleProcess,
  getAllLiveServicesName,
  addprice

};
