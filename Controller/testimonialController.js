const mongoose = require("mongoose");
const Testimonials = require("../Models/testimonialModel");

const addTestimonial = async (req, res) => {
  try {
    let { image, whatwedid, clientsays, rating, published, boost, boosttext } = req.body;
    const missingFields = [];

    // 🔍 Validate required fields
    if (!image) missingFields.push({ name: "image", message: "Image is required" });
    if (!whatwedid) missingFields.push({ name: "whatwedid", message: "What We Did is required" });
    if (!clientsays) missingFields.push({ name: "clientsays", message: "Client Says is required" });
    if (rating === undefined) missingFields.push({ name: "rating", message: "Rating is required" });
    if (!boost) missingFields.push({ name: "boost", message: "Boost is required" });
    if (!boosttext) missingFields.push({ name: "boosttext", message: "Boost Text is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Some fields are missing!", missingFields });
    }

    const testimonial = new Testimonials({
      image,
      whatwedid,
      clientsays,
      rating,
      published: published === "true" || published === true,
      boost,
      boosttext,
    });

    await testimonial.save();

    res.status(201).json({ status: 201, message: "Testimonial added successfully", testimonial });
  } catch (error) {
    console.error("Error adding testimonial:", error);
    res.status(500).json({ status: 500, message: "Failed to add testimonial", error: error.message });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    let { image, whatwedid, clientsays, rating, published, boost, boosttext } = req.body;
    const testimonial = await Testimonials.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    const missingFields = [];
    if (!image) missingFields.push({ name: "image", message: "Image is required" });
    if (!whatwedid) missingFields.push({ name: "whatwedid", message: "What We Did is required" });
    if (!clientsays) missingFields.push({ name: "clientsays", message: "Client Says is required" });
    if (rating === undefined) missingFields.push({ name: "rating", message: "Rating is required" });
    if (!boost) missingFields.push({ name: "boost", message: "Boost is required" });
    if (!boosttext) missingFields.push({ name: "boosttext", message: "Boost Text is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Some fields are missing!", missingFields });
    }

    testimonial.image = image;
    testimonial.whatwedid = whatwedid;
    testimonial.clientsays = clientsays;
    testimonial.rating = rating;
    testimonial.boost = boost;
    testimonial.boosttext = boosttext;

    if (published !== undefined) {
      testimonial.published = published === "true" || published === true || published === 1;
    }

    await testimonial.save();

    res.status(200).json({ status: 200, message: "Testimonial updated successfully", testimonial });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ status: 500, message: "Failed to update testimonial", error: error.message });
  }
};

const deleteAllTestimonial = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting { ids: ["id1", "id2", ...] }

    // ✅ Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. Please provide an array of testimonial IDs.",
      });
    }

    // ✅ Soft delete (mark as deleted)
    const result = await Testimonials.updateMany(
      { _id: { $in: ids } },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: `${result.modifiedCount} testimonial(s) soft deleted successfully.`,
      softDeletedTestimonials: ids,
    });
  } catch (error) {
    console.error("Error soft deleting testimonials:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};



// ✅ View All Testimonials (with Pagination)
const viewTestimonial = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalTestimonials = await Testimonials.countDocuments({ isDeleted: false });
    const testimonials = await Testimonials.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalTestimonials,
      totalPages: Math.ceil(totalTestimonials / limit),
      currentPage: page,
      limit,
      testimonials,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const viewTestimonialById = async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from URL params

    const testimonial = await Testimonials.findById(id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.status(200).json(testimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ View Only Published Testimonials (with Pagination)
const liveTestimonial = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalTestimonials = await Testimonials.countDocuments({ published: true , deleted: false});
    const testimonials = await Testimonials.find({ published: true, deleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalTestimonials,
      totalPages: Math.ceil(totalTestimonials / limit),
      currentPage: page,
      limit,
      testimonials,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  addTestimonial,
  updateTestimonial,
  deleteAllTestimonial,
  viewTestimonial,
  liveTestimonial,
  viewTestimonialById
};
