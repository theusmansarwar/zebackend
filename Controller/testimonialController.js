const Testimonial = require("../Models/testimonialModel");



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

    // ✅ Return error if fields are missing
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    const testimonial = new Testimonials({
      name,
      service,
      location,
      description,
      date,
      rating,
      published,
      
    });

    await testimonial.save();

    res.status(201).json({
      status:201,
      message: "Testimonial added successfully",
      testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add testimonial",
      error: error.message,
    });
  }
};


const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, published } = req.body;

    if (!name) return res.status(400).json({ message: "Category name is required" });

    name = name.trim();
    const existingCategory = await Testimonial.findOne({ name: new RegExp(`^${name}$`, "i") });

    if (existingCategory && existingCategory._id.toString() !== id) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const category = await Testimonial.findByIdAndUpdate(
      id,
      { name, published },
      { new: true, runValidators: true }
    );

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ status: 200, message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Testimonial.findByIdAndDelete(id);

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Team Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const deleteAllTestimonial = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting { ids: ["id1", "id2", ...] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide category IDs." });
    }

    await Testimonial.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "Team Categories deleted successfully.",
      deletedCategories: ids
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View All Team Categories with Pagination
const viewTestimonial = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default page = 1
    const limit = parseInt(req.query.limit) || 10; // Default limit = 10

    const totalCategories = await Testimonial.countDocuments();
    const categories = await Testimonial.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
      limit,
      categories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View Only Published Team Categories with Pagination
const liveTestimonial = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalCategories = await Testimonial.countDocuments({ published: true });
    const categories = await Testimonial.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
      limit,
      categories
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
  liveTestimonial
};
