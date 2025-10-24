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


const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      published,
      icon,
      faqs,
      imageSection,
      lastSection,
      subServices,
    } = req.body;

    const missingFields = [];
    const isPublished = published === "true" || published === true;

    // 🔍 Validate top-level fields if published
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

    // ✅ Parse and validate nested sections
    let faqsData = {};
    if (faqs) {
      const parsedFaqs = typeof faqs === "string" ? JSON.parse(faqs) : faqs;
      faqsData = {
        title: parsedFaqs.title,
        description: parsedFaqs.description,
        items: parsedFaqs.items || [],
        published:
          parsedFaqs.published === "true" || parsedFaqs.published === true,
      };

      if (faqsData.published) {
        if (!faqsData.title)
          missingFields.push({
            name: "faqs.title",
            message: "FAQs title is required",
          });
        if (!faqsData.description)
          missingFields.push({
            name: "faqs.description",
            message: "FAQs description is required",
          });
      }
    }

    let imageSectionData = {};
    if (imageSection) {
      const parsed =
        typeof imageSection === "string"
          ? JSON.parse(imageSection)
          : imageSection;
      imageSectionData = {
        title: parsed.title,
        image: parsed.image,
        published: parsed.published === "true" || parsed.published === true,
      };

      if (imageSectionData.published) {
        if (!imageSectionData.title)
          missingFields.push({
            name: "imageSection.title",
            message: "Image section title is required",
          });
        if (!parsed.image)
          missingFields.push({
            name: "imageSection.image",
            message: "Image path is required",
          });
      }
    }

    let lastSectionData = {};
    if (lastSection) {
      const parsed =
        typeof lastSection === "string" ? JSON.parse(lastSection) : lastSection;
      lastSectionData = {
        title: parsed.title,
        description: parsed.description,
        image: parsed.image,
        published: parsed.published === "true" || parsed.published === true,
      };

      if (lastSectionData.published) {
        if (!lastSectionData.title)
          missingFields.push({
            name: "lastSection.title",
            message: "Last section title is required",
          });
        if (!lastSectionData.description)
          missingFields.push({
            name: "lastSection.description",
            message: "Last section description is required",
          });
        if (!parsed.image)
          missingFields.push({
            name: "lastSection.image",
            message: "Last section image is required",
          });
      }
    }

    let subServicesData = {};
    if (subServices) {
      const parsed =
        typeof subServices === "string" ? JSON.parse(subServices) : subServices;
      subServicesData = {
        published: parsed.published === "true" || parsed.published === true,
        items: parsed.items || [],
      };
    }

    // ❌ Stop if any required fields missing
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    // ✅ Prepare update object
    const updateFields = {
      title,
      description,
      short_description,
      metaDescription,
      slug,
      icon,
      published: isPublished,
    };

    if (faqs) updateFields.faqs = faqsData;
    if (imageSection) updateFields.imageSection = imageSectionData;
    if (lastSection) updateFields.lastSection = lastSectionData;
    if (subServices) updateFields.subServices = subServicesData;

    // ✅ Perform update
    const updatedService = await Services.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedService) {
      return res.status(404).json({
        status: 404,
        message: "Service not found",
      });
    }

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

    let filter = {
      published: true,
      isDeleted: false, // ✅ only include non-deleted items
    }; // ✅ Only published services
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

    // ✅ Soft delete (mark as deleted)
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
  createSubService,
  updateService,
  listserviceAdmin,
  getServiceById,
  deleteAllservices,
  getServiceBySlug,
  getservicesSlugs,
  listservice,
};
