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
    
    res.status(201).json({ message: "Category added successfully", category });
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

    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Category (Show List of Related Blogs)
const deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
  
      // ✅ Find all blogs linked to this category
      const existingBlogs = await Blogs.find({ category: id }).select("title _id slug");
  
      if (existingBlogs.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete category. It is linked to blogs.", 
          blogs: existingBlogs // ✅ Return list of linked blogs (ID + Title)
        });
      }
  
      // ✅ Delete the category if no linked blogs
      const category = await Category.findByIdAndDelete(id);
      if (!category) return res.status(404).json({ message: "Category not found" });
  
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
// ✅ View All Categories
const viewCategory = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View Only Published Categories
const liveCategory = async (req, res) => {
  try {
    const categories = await Category.find({ published: true }).sort({ createdAt: -1 });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addCategory, updateCategory, deleteCategory, viewCategory, liveCategory };
