const Testimonials = require("../Models/testimonialModel");

// ✅ Add Testimonial
// Create Testimonial
const addTestimonial = async (req, res) => {
  try {
    let { name, whatwedid, clientsays, rating, published, boost, boosttext } = req.body;
    const missingFields = [];

    // 🔍 Validate required fields
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!whatwedid) missingFields.push({ name: "whatwedid", message: "What We Did is required" });
    if (!clientsays) missingFields.push({ name: "clientsays", message: "Client Says is required" });
    if (rating === undefined) missingFields.push({ name: "rating", message: "Rating is required" });
    if (!boost) missingFields.push({ name: "boost", message: "Boost is required" });
    if (!boosttext) missingFields.push({ name: "boosttext", message: "Boost Text is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Some fields are missing!", missingFields });
    }

    const testimonial = new Testimonials({
      name,
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
    let { name, whatwedid, clientsays, rating, published, boost, boosttext } = req.body;
    const testimonial = await Testimonials.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    const missingFields = [];
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!whatwedid) missingFields.push({ name: "whatwedid", message: "What We Did is required" });
    if (!clientsays) missingFields.push({ name: "clientsays", message: "Client Says is required" });
    if (rating === undefined) missingFields.push({ name: "rating", message: "Rating is required" });
    if (!boost) missingFields.push({ name: "boost", message: "Boost is required" });
    if (!boosttext) missingFields.push({ name: "boosttext", message: "Boost Text is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Some fields are missing!", missingFields });
    }

    testimonial.name = name;
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


// ✅ Delete Testimonial
const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonials.findByIdAndDelete(id);

    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });

    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Multiple Testimonials
const deleteAllTestimonial = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting { ids: ["id1", "id2", ...] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide testimonial IDs." });
    }

    await Testimonials.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ status: 200, message: "Testimonials deleted successfully.", deletedTestimonials: ids });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View All Testimonials (with Pagination)
const viewTestimonial = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalTestimonials = await Testimonials.countDocuments();
    const testimonials = await Testimonials.find()
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

    const totalTestimonials = await Testimonials.countDocuments({ published: true });
    const testimonials = await Testimonials.find({ published: true })
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
  deleteTestimonial,
  deleteAllTestimonial,
  viewTestimonial,
  liveTestimonial,
  viewTestimonialById
};
