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
      metatitle,
      description,
      short_description,
      metaDescription,
      slug,
      published,
      icon,
      menuImg
    } = req.body;

    const missingFields = [];
    const isPublished = published === "true" || published === true;
    if (isPublished) {
      if (!title)
        missingFields.push({ name: "title", message: "Title is required" });
      if (!metatitle)
        missingFields.push({
          name: "metatitle",
          message: "Meta Title is required",
        });
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
        if (!menuImg)
        missingFields.push({
          name: "menuImg",
          message: "Menu image is required",
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
      metatitle,
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

    // ✅ Parse possible JSON fields
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        try {
          const parsed = JSON.parse(req.body[key]);
          if (typeof parsed === "object") req.body[key] = parsed;
        } catch (e) {}
      }
    }

    // ✅ Destructure from body
    const {
      title,
      metatitle,
      description,
      short_description,
      metaDescription,
      slug,
      published,
      icon,
      menuImg,
      faqs = {},
      imageSection = {},
      lastSection = {},
      subServices = {},
    } = req.body;

    // ✅ Check if service exists
    const existingService = await Services.findById(id).lean();
    if (!existingService) {
      return res.status(404).json({
        status: 404,
        message: "Service not found",
      });
    }

    // ✅ Ensure nested objects exist
    existingService.faqs ??= {};
    existingService.imageSection ??= {};
    existingService.lastSection ??= {};
    existingService.subServices ??= {};

    // ✅ Boolean parser
    const parseBool = (val, fallback) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      return fallback;
    };

    const missingFields = [];
    const isPublished = parseBool(published, existingService.published);

    // ✅ Validate top-level fields if published
    if (isPublished) {
      if (!title) missingFields.push({ name: "title", message: "Title is required" });
      if (!metatitle) missingFields.push({ name: "metatitle", message: "Meta Title is required" });
      if (!description) missingFields.push({ name: "description", message: "Description is required" });
      if (!metaDescription) missingFields.push({ name: "metaDescription", message: "Meta Description is required" });
      if (!slug) missingFields.push({ name: "slug", message: "Slug is required" });
      if (!icon) missingFields.push({ name: "icon", message: "Icon is required" });
       if (!menuImg)
        missingFields.push({
          name: "menuImg",
          message: "menuImg is required",
        });
    }

    // ✅ Section Data Merge
    const faqsData = {
      title: faqs.title ?? existingService.faqs?.title ?? "",
      description: faqs.description ?? existingService.faqs?.description ?? "",
      items: faqs.items ?? existingService.faqs?.items ?? [],
      published: parseBool(faqs.published, existingService.faqs?.published),
    };

    const imageSectionData = {
      title: imageSection.title ?? existingService.imageSection?.title ?? "",
      image: imageSection.image ?? existingService.imageSection?.image ?? "",
      published: parseBool(imageSection.published, existingService.imageSection?.published),
    };

    const lastSectionData = {
      title: lastSection.title ?? existingService.lastSection?.title ?? "",
      description: lastSection.description ?? existingService.lastSection?.description ?? "",
      image: lastSection.image ?? existingService.lastSection?.image ?? "",
      published: parseBool(lastSection.published, existingService.lastSection?.published),
    };

    const subServicesData = {
      published: parseBool(subServices.published, existingService.subServices?.published),
      items: subServices.items ?? existingService.subServices?.items ?? [],
    };

    // ✅ Validate each section if published
    if (faqsData.published) {
      if (!faqsData.title) missingFields.push({ name: "faqs.title", message: "FAQ title is required" });
      if (!faqsData.description) missingFields.push({ name: "faqs.description", message: "FAQ description is required" });
      if (!Array.isArray(faqsData.items) || faqsData.items.length === 0)
        missingFields.push({ name: "faqs.items", message: "At least one FAQ item is required" });
    }

    if (imageSectionData.published) {
      if (!imageSectionData.title)
        missingFields.push({ name: "imageSection.title", message: "Image Section title is required" });
      if (!imageSectionData.image)
        missingFields.push({ name: "imageSection.image", message: "Image Section image is required" });
    }

    if (lastSectionData.published) {
      if (!lastSectionData.title)
        missingFields.push({ name: "lastSection.title", message: "Last Section title is required" });
      if (!lastSectionData.description)
        missingFields.push({ name: "lastSection.description", message: "Last Section description is required" });
      if (!lastSectionData.image)
        missingFields.push({ name: "lastSection.image", message: "Last Section image is required" });
    }

    if (subServicesData.published) {
      if (!Array.isArray(subServicesData.items) || subServicesData.items.length === 0)
        missingFields.push({ name: "subServices.items", message: "At least one Sub Service item is required" });
    }

    // ✅ Stop early if any fields missing
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    // ✅ Build update payload
    const updateFields = {
      title: title ?? existingService.title,
      metatitle: metatitle ?? existingService.metatitle,
      description: description ?? existingService.description,
      short_description: short_description ?? existingService.short_description,
      metaDescription: metaDescription ?? existingService.metaDescription,
      slug: slug ?? existingService.slug,
      icon: icon ?? existingService.icon,
       menuImg: menuImg ?? existingService.menuImg,
      published: isPublished,
      faqs: faqsData,
      imageSection: imageSectionData,
      lastSection: lastSectionData,
      subServices: subServicesData,
    };

    // ✅ Update and return
    const updatedService = await Services.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      status: 200,
      message: "Service updated successfully",
      service: updatedService,
    });

  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const listserviceAdmin = async (req, res) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Base filter
    let filter = { isDeleted: { $ne: true } };

    // Escape regex safely
    const escapeRegex = (text) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    // Apply search filter if provided
    if (search && search.trim() !== "") {
      const escapedSearch = escapeRegex(search);
      const regex = new RegExp(escapedSearch, "i");

      // Search across multiple fields for flexibility
      filter.$or = [
        { title: { $regex: regex } },
        { slug: { $regex: regex } },
        { short_description: { $regex: regex } },
      ];
    }

    // Query services
    const servicesList = await Services.find(filter)
      .select("title short_description slug published createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Count total for pagination
    const totalServices = await Services.countDocuments(filter);

    // Response
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
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let filter = {
      published: true,
      isDeleted: false,
    };

    // Escape regex safely
    const escapeRegex = (text) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    // Apply search filter if provided
    if (search && search.trim() !== "") {
      const escapedSearch = escapeRegex(search);
      const regex = new RegExp(escapedSearch, "i");
      filter.title = { $regex: regex };
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

const listmenuservice = async (req, res) => {
  try {
    let filter = {
      published: true,
      isDeleted: false,
    };

    const servicesList = await Services.find(filter)
      .select("title slug menuImg -_id ")
      .populate({
        path: "subServices.items",
        match: {
          isDeleted: { $ne: true },
        },
        select: "title slug -_id",
      })
      .sort({ createdAt: -1 });

    const totalServices = await Services.countDocuments(filter);

    return res.status(200).json({
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

    const service = await Services.findById(id)
      .populate({
        path: "faqs.items",
        match: { isDeleted: { $ne: true } },
        select: "question answer",
      })
      .populate({
        path: "subServices.items",
        match: {
          isDeleted: { $ne: true },
        },
        select: "title description _id published",
      });
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
      .populate({
        path: "faqs.items",
        match: { isDeleted: { $ne: true } }, // only include non-deleted FAQs
        select: "question answer",
      })
      .populate({
        path: "subServices.items",
        match: {
          isDeleted: { $ne: true },
        },
        select: "title short_description slug icon",
      })
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
  listmenuservice,
};
