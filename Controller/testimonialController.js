const Testimonials = require("../Models/testimonialModel");

// ✅ Add Testimonial
const addTestimonial = async (req, res) => {
  try {
    let { name, service, location, description, date, rating, published } = req.body;
    const missingFields = [];

    // ✅ Validate required fields
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!service) missingFields.push({ name: "service", message: "Service is required" });
    if (!location) missingFields.push({ name: "location", message: "Location is required" });
    if (!description) missingFields.push({ name: "description", message: "Description is required" });
    if (!date) missingFields.push({ name: "date", message: "Date is required" });
    if (!rating) missingFields.push({ name: "rating", message: "Rating is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Some fields are missing!", missingFields });
    }

    const testimonial = new Testimonials({ name, service, location, description, date, rating, published });
    await testimonial.save();

    res.status(201).json({ status: 201, message: "Testimonial added successfully", testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add testimonial", error: error.message });
  }
};

// ✅ Update Testimonial
const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, service, location, description, date, rating, published } = req.body;

    const existingTestimonial = await Testimonials.findById(id);
    if (!existingTestimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    const missingFields = [];
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!service) missingFields.push({ name: "service", message: "Service is required" });
    if (!location) missingFields.push({ name: "location", message: "Location is required" });
    if (!description) missingFields.push({ name: "description", message: "Description is required" });
    if (!date) missingFields.push({ name: "date", message: "Date is required" });
    if (!rating) missingFields.push({ name: "rating", message: "Rating is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Some fields are missing!", missingFields });
    }

    // ✅ Check for duplicate name (excluding the current testimonial)
    const duplicateTestimonial = await Testimonials.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (duplicateTestimonial && duplicateTestimonial._id.toString() !== id) {
      return res.status(400).json({ message: "Testimonial with this name already exists" });
    }

    // ✅ Handle Image Update
    let imagePath = existingTestimonial.image;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const updatedTestimonial = await Testimonials.findByIdAndUpdate(
      id,
      { name, service, location, description, date, rating, published, image: imagePath },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Testimonial updated successfully", updatedTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update testimonial", error: error.message });
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
};
