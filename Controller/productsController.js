const mongoose = require("mongoose");
const Product = require("../Models/productsModel");

// ✅ Add Product
const addProduct = async (req, res) => {
  try {
    let { name, description,detail,file, image, published } = req.body;
    const missingFields = [];

    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!description) missingFields.push({ name: "description", message: "Description is required" });
     if (!detail) missingFields.push({ name: "detail", message: "Detail is required" });
    if (!image) missingFields.push({ name: "image", message: "Image is required" });
    if (!file) missingFields.push({ name: "file", message: "File is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    name = name.trim();

    const existingProduct = await Product.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const newProduct = new Product({ name, description, detail, image, file, published });
    await newProduct.save();

    res.status(201).json({
      status: 201,
      message: "Product added successfully",
      Product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Product (with missing field check)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, description,detail, image,file, published } = req.body;

    const missingFields = [];
    if (!name) missingFields.push({ name: "name", message: "Name is required" });
    if (!description) missingFields.push({ name: "description", message: "Description is required" });
    
    if (!file) missingFields.push({ name: "file", message: "File is required" });
     if (!detail) missingFields.push({ name: "detail", message: "Detail is required" });
    if (!image) missingFields.push({ name: "image", message: "Image is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    name = name.trim();

    const existingProduct = await Product.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existingProduct && existingProduct._id.toString() !== id) {
      return res.status(400).json({ message: "Product name already exists" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, image, detail, file, published },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      status: 200,
      message: "Product updated successfully",
      Product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ 
        status: 404, 
        message: "Product not found" 
      });
    }

    res.status(200).json({
      status: 200,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching Product:", error);
    res.status(500).json({ 
      status: 500, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};


const deleteAllProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    // ✅ Validate request body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid request. Provide a non-empty array of Product IDs.",
      });
    }

    // ✅ Filter valid MongoDB ObjectIds
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "No valid Product IDs provided.",
      });
    }

    // ✅ Check if any Products exist
    const Products = await Product.find({ _id: { $in: validIds } });
    if (Products.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No Products found with the provided IDs.",
      });
    }

    // ✅ Delete all matching Products
    const result = await Product.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      status: 200,
      message: `${result.deletedCount} Product record(s) deleted successfully.`,
      deletedIds: validIds,
    });
  } catch (error) {
    console.error("Error deleting Products:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
// ✅ View Products with pagination
const viewProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search } = req.query;

    // Base filter
    let filter = { isDeleted: false };

    // Escape regex safely
    const escapeRegex = (text) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    // Apply search filter if provided
    if (search && search.trim() !== "") {
      const escapedSearch = escapeRegex(search);
      const regex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }

    // Count total
    const totalProducts = await Product.countDocuments(filter);

    // Fetch paginated results
    const Products = await Product.find(filter)
      .select("-detail -isDeleted -updatedAt -__v")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Send response
    res.status(200).json({
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      limit,
      Products,
    });
  } catch (error) {
    console.error("Error fetching case studies:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// ✅ View only published Products
const liveProduct = async (req, res) => {
  try {
    const Products = await Product.find({ published: true, isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json({
      totalProducts: Products.length,
      Products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  viewProduct,
  getProductById,
  liveProduct,
  deleteAllProducts,
};
