const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Services = require("../Models/serviceModel");
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

const createservice = async (req, res) => {
  try {
    const {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      detail,
      published,
      icon,
    } = req.body;

    const missingFields = [];
    const isPublished = published === "true" || published === true;

    // ✅ Validate required fields only if published
    if (isPublished) {
      if (!title)
        missingFields.push({ name: "title", message: "Title is required" });
      if (!description)
        missingFields.push({
          name: "description",
          message: "Description is required",
        });
      if (!short_description)
        missingFields.push({
          name: "short_description",
          message: "Short description is required",
        });
      if (!metaDescription)
        missingFields.push({
          name: "metaDescription",
          message: "Meta description is required",
        });
      if (!slug)
        missingFields.push({ name: "slug", message: "Slug is required" });
      if (!detail)
        missingFields.push({ name: "detail", message: "Detail is required" });
      if (!icon)
        missingFields.push({ name: "icon", message: "Icon is required" });
    }

    // ✅ If any required fields are missing, stop
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    // ✅ Check duplicate title & slug
    const [existingTitle, existingSlug] = await Promise.all([
      title ? Services.findOne({ title }) : null,
      slug ? Services.findOne({ slug }) : null,
    ]);

    if (existingTitle) {
      missingFields.push({
        name: "title",
        message: "Service title already exists",
      });
    }
    if (existingSlug) {
      missingFields.push({
        name: "slug",
        message: "Service slug already exists",
      });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed!",
        missingFields,
      });
    }

    // ✅ Create new service
    const newService = await Services.create({
      title,
      description,
      short_description,
      metaDescription,
      slug,
      detail,
      icon,
      published: isPublished,
    });

    res.status(201).json({
      status: 201,
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { createservice };

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      detail,
      published,
      faqs,
      how_we_delivered,
      portfolio_published,
      video,
      icon,
    } = req.body;

    const missingFields = [];
    const isPublished = published === "true" || published === true;

    // 🔍 Validation for top-level publish
    if (isPublished) {
      if (!title)
        missingFields.push({ name: "title", message: "Title is required" });
      if (!description)
        missingFields.push({
          name: "description",
          message: "Description is required",
        });
      if (!metaDescription)
        missingFields.push({
          name: "metaDescription",
          message: "Meta description is required",
        });
      if (!slug)
        missingFields.push({ name: "slug", message: "Slug is required" });
      let iconPath;
      if (req.file) {
        iconPath = `/uploads/${req.file.filename}`;
      } else if (req.body.icon) {
        iconPath = req.body.icon;
      } else {
        missingFields.push({
          name: "icon",
          message: "Icon is required",
        });
      }
    }

    // 🔍 Validation for FAQs section
    // 🔍 Validation for FAQs section
    let faqsData = {};
    if (faqs) {
      const parsedFaqs = typeof faqs === "string" ? JSON.parse(faqs) : faqs;

      faqsData = {
        title: parsedFaqs.title,
        description: parsedFaqs.description,
        published:
          parsedFaqs.published === "true" || parsedFaqs.published === true,
      };

      if (faqsData.published) {
        if (!faqsData.title) {
          missingFields.push({
            name: "faqs.title",
            message: "FAQs title is required",
          });
        }
        if (!faqsData.description) {
          missingFields.push({
            name: "faqs.description",
            message: "FAQs description is required",
          });
        }
      }
    }

    // 🔍 Validation for How We Delivered section
    let howWeDeliveredData = {};
    if (how_we_delivered) {
      const parsed =
        typeof how_we_delivered === "string"
          ? JSON.parse(how_we_delivered)
          : how_we_delivered;
      howWeDeliveredData = {
        description: parsed.description,
        lower_description: parsed.lower_description,
        image: req.file ? `/uploads/${req.file.filename}` : parsed.image, // ✅ File upload
        published: parsed.published === "true" || parsed.published === true,
      };

      if (howWeDeliveredData.published) {
        if (!howWeDeliveredData.description) {
          missingFields.push({
            name: "how_we_delivered.description",
            message: "Description is required",
          });
        }
        if (!howWeDeliveredData.lower_description) {
          missingFields.push({
            name: "how_we_delivered.lower_description",
            message: "lower_description is required",
          });
        }
        if (!req.file && !parsed.image) {
          missingFields.push({
            name: "how_we_delivered.image",
            message: "Image file is required",
          });
        }
      }
    }

    // 🔍 Validation for Video section
    // 🔍 Validation for Video section
    let videoData = {};
    if (video) {
      const parsedVideo = typeof video === "string" ? JSON.parse(video) : video;

      videoData = {
        description: parsedVideo.description,
        url: parsedVideo.url,
        published:
          parsedVideo.published === "true" || parsedVideo.published === true,
      };

      if (videoData.published) {
        if (!videoData.description) {
          missingFields.push({
            name: "video.description",
            message: "Video description is required",
          });
        }
        if (!videoData.url) {
          missingFields.push({
            name: "video.url",
            message: "Video URL is required",
          });
        }
      }
    }

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({
          status: 400,
          message: "Some fields are missing!",
          missingFields,
        });
    }

    // ✅ Prepare update fields
    const updateFields = {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      detail,
      icon,
      published: isPublished,
    };

    if (faqs !== undefined) {
  const parsedFaqs = typeof faqs === "string" ? JSON.parse(faqs) : faqs;

  Object.keys(parsedFaqs).forEach((key) => {
    updateFields[`faqs.${key}`] = parsedFaqs[key];
  });
}

    if (how_we_delivered) updateFields.how_we_delivered = howWeDeliveredData;
  if (portfolio_published !== undefined) {
  updateFields["portfolio.published"] =
    portfolio_published === "true" || portfolio_published === true;
}

    if (video) updateFields.video = videoData;

    // ✅ Save to DB
    const updatedService = await Services.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res
      .status(500)
      .json({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
  }
};

const listserviceAdmin = async (req, res) => {
  try {
    const { title } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let filter = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const servicesList = await Services.find(filter)
      .select("title short_description published createdAt") // ✅ Only required fields
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalServices = await Services.countDocuments(filter);

    return res.status(200).json({
      totalServices,
      totalPages: Math.ceil(totalServices / limit),
      currentPage: page,
      limit,
      services: servicesList,
    });
  } catch (error) {
    console.error("Error fetching services (Admin):", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const listservice = async (req, res) => {
  try {
    const { title } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let filter = { published: true }; // ✅ Only published services
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const servicesList = await Services.find(filter)
      .select("title short_description createdAt slug icon") // ✅ Keep published too if you want to show status
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalServices = await Services.countDocuments(filter);

    return res.status(200).json({
      totalServices,
      totalPages: Math.ceil(totalServices / limit),
      currentPage: page,
      limit,
      services: servicesList,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Services.findById(id).populate(
      "faqs.items",
      "question answer"
    )
    .populate("portfolio.items","title description images videos thumbnail published") ;
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Service fetched successfully",
      service,
    });
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    res.status(500).json({ error: error.message });
  }
};
const getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await Services.findOne({ slug, published: true }).populate(
      "faqs.items",
      "question answer"
    )
      .populate("portfolio.items","title description images videos thumbnail published") 
      .exec();

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Service fetched successfully",
      service,
    });
  } catch (error) {
    console.error("Error fetching service by slug:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteAllservices = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request. Provide ServiceCategory IDs." });
    }

    await Services.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "Categories Delete successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getservicesSlugs = async (req, res) => {
  try {
    const serviceslist = await Services.find({ published: true })
      .select("slug _id title")
      .sort({ publishedDate: -1 });

    const totalServices = await Services.countDocuments({ published: true });

    res.status(200).json({
      totalServices,
      slugs: serviceslist,
    });
  } catch (error) {
    console.error("Error fetching blog slugs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createservice,
  updateService: [upload.single("image"), updateService],
  listserviceAdmin,
  getServiceById,
  deleteAllservices,
  getServiceBySlug,
  getservicesSlugs,
  listservice,
};
