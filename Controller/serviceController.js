const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Services = require("../Models/serviceModel");
const Faqs = require("../Models/faqsModel");

const createservice = async (req, res) => {
  try {
    const {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      published,
      icon,
    } = req.body;

    const missingFields = [];
    const isPublished = published === "true" || published === true;
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
      if (!icon)
        missingFields.push({ name: "icon", message: "Icon is required" });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }
    const existing = await Services.findOne({
      $or: [{ title }, { slug }],
    });

    if (existing) {
      if (existing.title === title)
        missingFields.push({
          name: "title",
          message: "Service title already exists",
        });
      if (existing.slug === slug)
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
    const newService = await Services.create({
      title,
      description,
      short_description,
      metaDescription,
      slug,
      icon,
      published: isPublished,
    });

    return res.status(201).json({
      status: 201,
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Parse stringified JSON fields
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        try {
          req.body[key] = JSON.parse(req.body[key]);
        } catch (e) {}
      }
    }

    const {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      published,
      icon,
      faqs = {},
      imageSection = {},
      lastSection = {},
      subServices = {},
    } = req.body;

    console.log("📦 RAW BODY RECEIVED:", req.body);

    // ✅ Get existing service
    const existingService = await Services.findById(id);
    if (!existingService) {
      return res.status(404).json({
        status: 404,
        message: "Service not found",
      });
    }

    // ✅ Validate required fields if published
    const missingFields = [];
    const isPublished = published === "true" || published === true;

    if (isPublished) {
      if (!title) missingFields.push({ name: "title", message: "Title is required" });
      if (!description) missingFields.push({ name: "description", message: "Description is required" });
      if (!metaDescription) missingFields.push({ name: "metaDescription", message: "Meta description is required" });
      if (!slug) missingFields.push({ name: "slug", message: "Slug is required" });
      if (!icon) missingFields.push({ name: "icon", message: "Icon is required" });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    // ✅ Merge old + new FAQ data (preserve items if not sent)
    const faqsData = {
      title: faqs.title ?? existingService.faqs.title ?? "",
      description: faqs.description ?? existingService.faqs.description ?? "",
      items: faqs.items ?? existingService.faqs.items ?? [],
      published: faqs.published === "true" || faqs.published === true || existingService.faqs.published,
    };

    // ✅ Merge old + new image section
    const imageSectionData = {
      title: imageSection.title ?? existingService.imageSection.title ?? "",
      image: imageSection.image ?? existingService.imageSection.image ?? "",
      published:
        imageSection.published === "true" ||
        imageSection.published === true ||
        existingService.imageSection.published,
    };

    // ✅ Merge old + new last section
    const lastSectionData = {
      title: lastSection.title ?? existingService.lastSection.title ?? "",
      description: lastSection.description ?? existingService.lastSection.description ?? "",
      image: lastSection.image ?? existingService.lastSection.image ?? "",
      published:
        lastSection.published === "true" ||
        lastSection.published === true ||
        existingService.lastSection.published,
    };

    // ✅ Merge old + new subServices (preserve items if not sent)
    const subServicesData = {
      published:
        subServices.published === "true" ||
        subServices.published === true ||
        existingService.subServices.published,
      items: subServices.items ?? existingService.subServices.items ?? [],
    };

    // ✅ Build update payload
    const updateFields = {
      title: title ?? existingService.title,
      description: description ?? existingService.description,
      short_description: short_description ?? existingService.short_description,
      metaDescription: metaDescription ?? existingService.metaDescription,
      slug: slug ?? existingService.slug,
      icon: icon ?? existingService.icon,
      published: isPublished,
      faqs: faqsData,
      imageSection: imageSectionData,
      lastSection: lastSectionData,
      subServices: subServicesData,
    };

    // ✅ Update and return new service
    const updatedService = await Services.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 200,
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
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
      .select("title short_description published createdAt")
      .populate("subServices.items")
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

    let filter = {
      published: true,
      isDeleted: false, 
    }; 

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const servicesList = await Services.find(filter)
      .select("title short_description createdAt slug icon")
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
    );
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

    const service = await Services.findOne({ slug, published: true })
      .populate("faqs.items", "question answer")
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
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. Provide Service IDs.",
      });
    }
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No valid service IDs provided." });
    }
    const existingServices = await Services.find({
      _id: { $in: validIds },
      isDeleted: false,
    });

    if (existingServices.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No active services found with the given IDs.",
      });
    }
    await Services.updateMany(
      { _id: { $in: validIds } },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: `${existingServices.length} service(s) soft-deleted successfully.`,
      deletedServices: validIds,
    });
  } catch (error) {
    console.error("Error soft deleting services:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getservicesSlugs = async (req, res) => {
  try {
    const serviceslist = await Services.find({
      published: true,
      isDeleted: false,
    })
      .select("slug _id title")
      .sort({ publishedDate: -1 });

    const totalServices = await Services.countDocuments({
      published: true,
      isDeleted: false,
    });

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
  updateService,
  listserviceAdmin,
  getServiceById,
  deleteAllservices,
  getServiceBySlug,
  getservicesSlugs,
  listservice,
};
