const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Services = require("../Models/serviceModel");
const SubServices = require("../Models/subServiceModel");
const Faqs = require("../Models/faqsModel");

const createSubService = async (req, res) => {
  try {
    const {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      published,
      icon,
      mainServiceId, // 👈 Parent service ID (must come from frontend)
    } = req.body;

    const missingFields = [];
    const isPublished = published === "true" || published === true;

    // ✅ Validation (required only if published)
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

    // ✅ Check duplicates
    const existing = await SubServices.findOne({
      $or: [{ title }, { slug }],
    });

    if (existing) {
      if (existing.title === title)
        missingFields.push({
          name: "title",
          message: "Sub-service title already exists",
        });
      if (existing.slug === slug)
        missingFields.push({
          name: "slug",
          message: "Sub-service slug already exists",
        });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed!",
        missingFields,
      });
    }

    // ✅ Create new subservice
    const newSubService = await SubServices.create({
      title,
      description,
      short_description,
      metaDescription,
      slug,
      icon,
      published: isPublished,
    });

    // ✅ Add subservice ID to parent service
    if (mainServiceId) {
      const parent = await Services.findById(mainServiceId);

      if (!parent) {
        return res.status(404).json({
          status: 404,
          message: "Parent service not found",
        });
      }

      // ✅ Push new subservice ID to items array
      parent.subServices.items.push(newSubService._id);

      // Optionally publish subServices if at least one exists
      parent.subServices.published = true;

      await parent.save();
    }

    return res.status(201).json({
      status: 201,
      message: "Sub-service created and linked successfully",
      subService: newSubService,
    });
  } catch (error) {
    console.error("Error creating sub-service:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const updateSubService = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Parse any JSON-like strings from body (from form-data or string inputs)
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
      introduction = {},
      provenSteps = {},
      whySection = {},
      cta = {},
      imageSection = {},
      faqs = {},
      portfolio = {},
    } = req.body;

    const missingFields = [];
    const isPublished = published === "true" || published === true;

    // ✅ Validate top-level fields if published
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
      if (!icon)
        missingFields.push({ name: "icon", message: "Icon is required" });
    }

    // ✅ Fetch existing record for merging
    const existing = await SubServices.findById(id);
    if (!existing) {
      return res.status(404).json({
        status: 404,
        message: "Sub-service not found",
      });
    }

    // ✅ Merge nested sections safely (retain old data if not sent)
    const introductionData = {
      title: introduction.title ?? existing.introduction?.title ?? "",
      description:
        introduction.description ?? existing.introduction?.description ?? "",
      image: introduction.image ?? existing.introduction?.image ?? "",
      published:
        introduction.published === "true" ||
        introduction.published === true ||
        existing.introduction?.published ||
        false,
    };

    const provenStepsData = {
      title: provenSteps.title ?? existing.provenSteps?.title ?? "",
      steps: provenSteps.steps ?? existing.provenSteps?.steps ?? [],
      published:
        provenSteps.published === "true" ||
        provenSteps.published === true ||
        existing.provenSteps?.published ||
        false,
    };

    const ctaData = {
      title: cta.title ?? existing.cta?.title ?? "",
      description: cta.description ?? existing.cta?.description ?? "",
      published:
        cta.published === "true" ||
        cta.published === true ||
        existing.cta?.published ||
        false,
    };
      const whySectionData = {
      title: whySection.title ?? existing.whySection?.title ?? "",
      description: whySection.description ?? existing.whySection?.description ?? "",
      published:
        whySection.published === "true" ||
        whySection.published === true ||
        existing.whySection?.published ||
        false,
    };

    const imageSectionData = {
      title: imageSection.title ?? existing.imageSection?.title ?? "",
      description:
        imageSection.description ?? existing.imageSection?.description ?? "",
      image: imageSection.image ?? existing.imageSection?.image ?? "",
      published:
        imageSection.published === "true" ||
        imageSection.published === true ||
        existing.imageSection?.published ||
        false,
    };

    const faqsData = {
      title: faqs.title ?? existing.faqs?.title ?? "",
      description: faqs.description ?? existing.faqs?.description ?? "",
      items: existing.faqs?.items || [], // keep linked FAQ IDs
      published:
        faqs.published === "true" ||
        faqs.published === true ||
        existing.faqs?.published ||
        false,
    };

    const portfolioData = {
      
      title: portfolio.title ?? existing.portfolio?.title ?? "",
      items: existing.portfolio?.items || [], // keep linked portfolio IDs
      published:
        portfolio.published === "true" ||
        portfolio.published === true ||
        existing.portfolio?.published ||
        false,
    };

    // ❌ Return if required fields missing
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    // ✅ Prepare final update object
    const updateFields = {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      icon,
      published: isPublished,
      introduction: introductionData,
      provenSteps: provenStepsData,
      cta: ctaData,
      imageSection: imageSectionData,
      faqs: faqsData,
      whySection: whySectionData,
      portfolio: portfolioData,
    };

    // ✅ Update document
    const updated = await SubServices.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 200,
      message: "Sub-service updated successfully",
      service: updated,
    });
  } catch (error) {
    console.error("Error updating sub-service:", error);
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

    const servicesList = await SubServices.find(filter)
      .select("title short_description published createdAt") // ✅ Only required fields
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalServices = await SubServices.countDocuments(filter);

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
      isDeleted: false, // ✅ only include non-deleted items
    }; // ✅ Only published services
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const servicesList = await SubServices.find(filter)
      .select("title short_description createdAt slug icon") // ✅ Keep published too if you want to show status
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalServices = await SubServices.countDocuments(filter);

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

    const service = await SubServices.findById(id).populate(
      "faqs.items",
      "question answer"
    ).populate("portfolio.items","title description images videos thumbnail published") ;
    
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

    const service = await SubServices.findOne({ slug, published: true })
      .populate("faqs.items", "question answer")
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

    // ✅ Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. Provide Service IDs.",
      });
    }

    // ✅ Filter valid ObjectIds
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No valid service IDs provided." });
    }

    // ✅ Check existing services
    const existingServices = await SubServices.find({
      _id: { $in: validIds },
      isDeleted: false,
    });

    if (existingServices.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No active services found with the given IDs.",
      });
    }

    // ✅ Soft delete (mark as deleted)
    await SubServices.updateMany(
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
    const serviceslist = await SubServices.find({
      published: true,
      isDeleted: false,
    })
      .select("slug _id title")
      .sort({ publishedDate: -1 });

    const totalServices = await SubServices.countDocuments({
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
  createSubService,
  updateSubService,
  listserviceAdmin,
  getServiceById,
  deleteAllservices,
  getServiceBySlug,
  getservicesSlugs,
  listservice,
};
