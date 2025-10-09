const mongoose = require("mongoose");
const Category = require("../Models/categoryModel");
const Blogs = require("../Models/blogModel"); // ✅ Required for blog-category relation

// ✅ Add Category
const addCategory = async (req, res) => {
  try {
    let { name, published } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    name = name.trim(); // ✅ Trim whitespace
    const existingCategory = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({ name, published });
    await category.save();
    
    res.status(201).json({ status: 201, message: "Category added successfully", category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, published } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    name = name.trim(); // ✅ Trim whitespace

    const existingCategory = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existingCategory && existingCategory._id.toString() !== id) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, published },
      { new: true, runValidators: true }
    );

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({  status: 200,message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


 const deleteAllCategories = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting { ids: ["id1", "id2", ...] }

    // ✅ Validate request body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. Provide a non-empty array of category IDs.",
      });
    }

    // ✅ Filter only valid MongoDB ObjectIds
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "No valid category IDs provided.",
      });
    }

    // ✅ Find all blogs linked to the given category IDs
    const linkedBlogs = await Blogs.find({ category: { $in: validIds } })
      .select("title _id category");

    // ✅ Extract IDs of categories that are linked to blogs
    const categoriesWithBlogs = [...new Set(linkedBlogs.map(blog => blog.category.toString()))];

    // ✅ Filter out deletable categories (those not linked)
    const categoriesToDelete = validIds.filter(id => !categoriesWithBlogs.includes(id));

    if (categoriesToDelete.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Cannot delete any categories — all are linked to existing blogs.",
        linkedBlogs,
      });
    }

    // ✅ Delete categories that are not linked to blogs
    const deleteResult = await Category.deleteMany({ _id: { $in: categoriesToDelete } });

    res.status(200).json({
      status: 200,
      message: `${deleteResult.deletedCount} category(ies) deleted successfully.`,
      deletedCategories: categoriesToDelete,
      failedToDelete: categoriesWithBlogs,
      linkedBlogs,
    });
  } catch (error) {
    console.error("Error deleting categories:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

  const viewCategory = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Default page = 1
      const limit = parseInt(req.query.limit) || 10; // Default limit = 10
  
      const totalCategories = await Category.countDocuments({ isDeleted: false });
      const categories = await Category.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);
  
      res.status(200).json({
        totalCategories,
        totalPages: Math.ceil(totalCategories / limit),
        currentPage: page,
        limit,
        categories,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // ✅ View Only Published Categories with Pagination
  const liveCategory = async (req, res) => {
    try {
      const categories = await Category.find({ published: true, isDeleted: false }).sort({ createdAt: -1 });
  
      res.status(200).json({
        totalCategories: categories.length,
        categories,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

module.exports = { addCategory, updateCategory, viewCategory, liveCategory,deleteAllCategories };
