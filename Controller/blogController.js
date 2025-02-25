const Blogs = require("../Models/blogModel");
const Comment = require("../Models/commentModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Category = require("../Models/categoryModel");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer Upload Middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

const createblog = async (req, res) => {
  try {
    const {
      title,
      description,
      detail,
      author,
      tags,
      metaDescription,
      slug,
      category,
      published,
    } = req.body;
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;

    const missingFields = [];

    if (published === "true" || published === true) {
      if (!title)
        missingFields.push({ name: "title", message: "Title is required" });
      if (!description)
        missingFields.push({
          name: "description",
          message: "Description is required",
        });
      if (!detail)
        missingFields.push({ name: "detail", message: "Detail is required" });
      if (!author)
        missingFields.push({ name: "author", message: "Author is required" });
      if (!tags)
        missingFields.push({ name: "tags", message: "Tags are required" });
      if (!metaDescription)
        missingFields.push({
          name: "metaDescription",
          message: "Meta description is required",
        });
      if (!slug)
        missingFields.push({ name: "slug", message: "Slug is required" });
      if (!thumbnail)
        missingFields.push({
          name: "thumbnail",
          message: "Thumbnail (image) is required",
        });
      if (!category)
        missingFields.push({
          name: "category",
          message: "Category is required",
        });

      if (missingFields.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "Some fields are missing!",
          missingFields,
        });
      }

      const existingTitle = await Blogs.findOne({ title });
      if (existingTitle) {
        return res.status(400).json({ message: "Blog Title already exists" });
      }

      const existingSlug = await Blogs.findOne({ slug });
      if (existingSlug) {
        return res.status(400).json({ message: "Blog Slug already exists" });
      }
    }

    const tagsArray = Array.isArray(tags)
      ? tags
      : tags
      ? tags.split(",").map((tag) => tag.trim())
      : [];

    const categoryExists = await Category.findById(category);
    console.log("Category Exists:", categoryExists);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    const newBlog = await Blogs.create({
      title,
      description,
      detail,
      author,
      slug,
      thumbnail,
      tags: tagsArray,
      metaDescription,
      published,

      category: { _id: categoryExists._id, name: categoryExists.name },
    });

    res
      .status(201)
      .json({ status: 201, message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateblog = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      title,
      description,
      detail,
      author,
      slug,
      tags,
      metaDescription,
      published,
      category,
    } = req.body;
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;

    // ✅ Convert `published` to Boolean (Handles "true"/"false" strings from form-data)
    if (typeof published === "string") {
      published = published === "true";
    }

    console.log("values for updates :", req.body);

    // ✅ Find the existing blog
    const existingBlog = await Blogs.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // ✅ Validate category (ensure it exists)
    let updatedCategory = existingBlog.category; // Keep current category if not updating
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      updatedCategory = { _id: categoryExists._id, name: categoryExists.name };
    }

    // ✅ Convert tags string to array if needed
    if (tags && typeof tags === "string") {
      tags = tags.split(",").map((tag) => tag.trim());
    }

    // ✅ Updating fields if provided in the request
    existingBlog.title = title || existingBlog.title;
    existingBlog.description = description || existingBlog.description;
    existingBlog.detail = detail || existingBlog.detail;
    existingBlog.author = author || existingBlog.author;
    existingBlog.slug = slug || existingBlog.slug;
    existingBlog.tags = tags || existingBlog.tags;
    existingBlog.metaDescription =
      metaDescription || existingBlog.metaDescription;
    existingBlog.category = updatedCategory;

    // ✅ Explicitly set `published` (allows both `true` and `false` values)
    existingBlog.published = published;

    // ✅ Update thumbnail if a new image is uploaded
    if (thumbnail) {
      // Remove old thumbnail if it exists
      if (existingBlog.thumbnail) {
        const oldThumbnailPath = path.join(
          __dirname,
          "..",
          existingBlog.thumbnail
        );
        if (fs.existsSync(oldThumbnailPath)) {
          fs.unlinkSync(oldThumbnailPath);
        }
      }
      existingBlog.thumbnail = thumbnail;
    }

    // ✅ Save updated blog
    await existingBlog.save();

    res
      .status(200)
      .json({ status: 200, message: "Blog updated successfully", blog: existingBlog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteblog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blogs.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    await Comment.deleteMany({ blogId: id });
    if (blog.thumbnail) {
      const filePath = path.join(__dirname, "..", blog.thumbnail);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the image file
      }
    }

    // ✅ Delete the blog
    await Blogs.findByIdAndDelete(id);

    res.status(200).json({ status:200, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const deletemultiblog = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of blog IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty list of blog IDs" });
    }

    // ✅ Find all blogs by IDs
    const blogs = await Blogs.find({ _id: { $in: ids } });

    if (blogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No blogs found with the given IDs" });
    }
    await Comment.deleteMany({ blogId: { $in: ids } });
    // ✅ Delete each blog's thumbnail if exists
    blogs.forEach((blog) => {
      if (blog.thumbnail) {
        const filePath = path.join(__dirname, "..", blog.thumbnail);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Delete the image file
        }
      }
    });

    // ✅ Delete blogs in one go
    await Blogs.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ status: 200, message: "Blogs deleted successfully" });
  } catch (error) {
    console.error("Error deleting blogs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const listblog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get page from query, default to 1
    const limit = parseInt(req.query.limit) || 10; // Get limit from query, default to 10

    const blogslist = await Blogs.find()
      .select("-comments -detail -published")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalBlogs = await Blogs.countDocuments();

    res.status(200).json({
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
      limit: limit,
      blogs: blogslist,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const listblogAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get page from query, default to 1
    const limit = parseInt(req.query.limit) || 10; // Get limit from query, default to 10

    const blogslist = await Blogs.find()
      .select("-comments -detail ")
      .sort({ createdAt: -1 })
      .populate({
        path: "category",
        model: "Category", // Explicitly specifying model
      })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalBlogs = await Blogs.countDocuments();

    res.status(200).json({
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
      limit: limit,
      blogs: blogslist,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const viewblog = async (req, res) => {
  try {
    const { slug } = req.params;
    const userIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress; // ✅ Get User's IP

    // ✅ Find the blog but do NOT modify it directly
    let blog = await Blogs.findOne({ slug })
      .populate("comments") // ✅ Populate comments
      .populate("category"); // ✅ Populate category

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // ✅ Check if the IP exists in viewedBy array
    if (!blog.viewedBy.includes(userIp)) {
      blog = await Blogs.findOneAndUpdate(
        { slug },
        {
          $inc: { views: 1 }, // ✅ Increment views
          $push: { viewedBy: userIp }, // ✅ Add new IP to viewedBy array
        },
        { new: true } // ✅ Return updated document
      )
        .populate("comments")
        .populate("category"); // ✅ Repopulate fields after update
    }

    const commentsCount = blog.comments.length || 0;

    return res.status(200).json({
      message: "Blog fetched successfully",
      blog,
      commentsCount,
    });
  } catch (error) {
    console.error("Error viewing blog:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const viewblogbyid = async (req, res) => {
  try {
    const { id } = req.params;
   
    let blog = await Blogs.findById({ id })
      .populate("comments") 
      .populate("category"); 

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

   

    const commentsCount = blog.comments.length || 0;

    return res.status(200).json({
      message: "Blog fetched successfully",
      blog,
      status:200,
      commentsCount,
    });
  } catch (error) {
    console.error("Error viewing blog:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
module.exports = {
  createblog: [upload.single("thumbnail"), createblog],
  updateblog: [upload.single("thumbnail"), updateblog],
  deleteblog,
  listblog,
  viewblog,
  deletemultiblog,
  listblogAdmin,
  viewblogbyid
};
