const Blogs = require("../Models/blogModel");
const Comment = require("../Models/commentModel");
const Category = require("../Models/categoryModel");
const mongoose = require("mongoose");


const createblog = async (req, res) => {
  try {
    const {
      title,
      description,
      detail,
      metaDescription,
      slug,
      category,
      published,
      thumbnail,
      faqSchema,
      featured,
    } = req.body;

    const missingFields = [];

    const isPublished = published === "true" || published === true;
    const isFeatured = featured === "true" || featured === true;

    // ✅ Title is always required
    if (!title) {
      missingFields.push({ name: "title", message: "Title is required" });
    }

    // ✅ If published, check all other required fields
    if (isPublished) {
      if (!description) missingFields.push({ name: "description", message: "Description is required" });
      if (!detail) missingFields.push({ name: "detail", message: "Detail is required" });
      if (!metaDescription) missingFields.push({ name: "metaDescription", message: "Meta description is required" });
      if (!slug) missingFields.push({ name: "slug", message: "Slug is required" });
      if (!thumbnail) missingFields.push({ name: "thumbnail", message: "Thumbnail is required" });
      if (!category) missingFields.push({ name: "category", message: "Category is required" });
    }

    // ✅ Stop here if any fields missing
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    // ✅ check duplicates only if published and all required fields are present
    if (isPublished) {
      const [existingTitle, existingSlug] = await Promise.all([
        Blogs.findOne({ title }),
        Blogs.findOne({ slug }),
      ]);
      if (existingTitle) {
        return res.status(400).json({
          status: 400,
          message: "Blog Title already exists",
        });
      }
      if (existingSlug) {
        return res.status(400).json({
          status: 400,
          message: "Blog Slug already exists",
        });
      }
    }

    let validCategory = undefined;
    if (category && category !== "") {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          status: 400,
          message: "Invalid category ID",
          missingFields: [{ name: "category", message: "Invalid category ID" }],
        });
      }
      validCategory = category;
    }

    const newBlog = await Blogs.create({
      title,
      description,
      detail,
      slug,
      thumbnail,
      metaDescription,
      published: isPublished,
      featured: isFeatured,
      category: validCategory,
      faqSchema,
    });

    res.status(201).json({
      status: 201,
      message: "Blog created successfully",
   
    });
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
 
    const { id } = req.params;
    const {
      title,
      description,
      detail,
      metaDescription,
      slug,
      category,
      published,
      thumbnail,
      faqSchema,
      featured,
    } = req.body;
console.log("Data coming in request is ", req.body);
try{
    let blog = await Blogs.findById(id);
    if (!blog) {
      return res.status(404).json({ status: 404, message: "Blog not found" });
    }

    const missingFields = [];
    const isPublished = published === "true" || published === true;
    const isFeatured = featured === "true" || featured === true;

    // ✅ Required validation
    if (!title && !blog.title) {
      missingFields.push({ name: "title", message: "Title is required" });
    }

    if (isPublished) {
      if (!(description || blog.description))
        missingFields.push({ name: "description", message: "Description is required" });
      if (!(detail || blog.detail))
        missingFields.push({ name: "detail", message: "Detail is required" });
      if (!(metaDescription || blog.metaDescription))
        missingFields.push({ name: "metaDescription", message: "Meta description is required" });
      if (!(slug || blog.slug))
        missingFields.push({ name: "slug", message: "Slug is required" });
      if (!(thumbnail || blog.thumbnail))
        missingFields.push({ name: "thumbnail", message: "Thumbnail is required" });
      if (!(category || blog.category))
        missingFields.push({ name: "category", message: "Category is required" });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Some fields are missing!", missingFields });
    }

    // ✅ Duplicate checks when publishing
    if (isPublished) {
      const [existingTitle, existingSlug] = await Promise.all([
        Blogs.findOne({ title, _id: { $ne: id } }),
        Blogs.findOne({ slug, _id: { $ne: id } }),
      ]);
      if (existingTitle) {
        return res.status(400).json({ status: 400, message: "Blog Title already exists" });
      }
      if (existingSlug) {
        return res.status(400).json({ status: 400, message: "Blog Slug already exists" });
      }
    }

    // ✅ Update only provided fields
    if (title !== undefined) blog.title = title;
    if (description !== undefined) blog.description = description;
    if (detail !== undefined) blog.detail = detail;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (slug !== undefined) blog.slug = slug;
    if (thumbnail !== undefined) blog.thumbnail = thumbnail;
    if (faqSchema !== undefined) blog.faqSchema = faqSchema;
    if (published !== undefined) blog.published = isPublished;
    if (featured !== undefined) blog.featured = isFeatured;

    // ✅ Category update
    if (category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ status: 400, message: "Invalid category ID" });
      }
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ status: 400, message: "Category not found" });
      }
      blog.category = categoryExists._id;
    }

    await blog.save();

    // ✅ Return blog with category populated
    blog = await Blogs.findById(id).populate("category");

    res.status(200).json({
      status: 200,
      message: "Blog updated successfully",
   
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
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

    // ✅ Find blogs to ensure they exist
    const blogs = await Blogs.find({ _id: { $in: ids }, isDeleted: false });

    if (blogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No blogs found with the given IDs" });
    }

    // ✅ Soft delete comments related to those blogs (optional)
    await Comment.updateMany(
      { blogId: { $in: ids } },
      { $set: { isDeleted: true } }
    );

    // ✅ Soft delete the blogs (mark as deleted instead of removing)
    await Blogs.updateMany(
      { _id: { $in: ids } },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: "Blogs soft-deleted successfully",
    });
  } catch (error) {
    console.error("Error soft-deleting blogs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const listblog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
  const { categoryId, search } = req.query; 


    // base filter
    let filter = { 
  published: true,  isDeleted: false // ✅ only include non-deleted items
};
;
if (categoryId && categoryId !== "all" && categoryId.trim() !== "") {
  filter["category._id"] = new mongoose.Types.ObjectId(categoryId);
}


    // ✅ Search filter (applied only if non-empty)
    if (search && search.trim() !== "") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "category.name": { $regex: search, $options: "i" } }, // allows searching by category name
        { author: { $regex: search, $options: "i" } }
      ];
    }

    // fetch blogs
    const blogslist = await Blogs.find(filter)
      .select("-comments -detail -published -viewedBy -isDeleted -faqSchema -featured -metaDescription -updatedAt -createdAt -views -__v  -category")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // total count
    const totalBlogs = await Blogs.countDocuments(filter);

    res.status(200).json({
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
      limit,
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

const getFeaturedblogs = async (req, res) => {
  try {
    const allFeaturedBlogs = await Blogs.find({
      published: true,
      featured: true,
    }).select("-comments -detail -published -viewedBy -isDeleted -faqSchema -featured -metaDescription -updatedAt -createdAt -views -__v  -category")
    .populate(
        "category",
        "name "
      )

    const shuffled = allFeaturedBlogs.sort(() => 0.5 - Math.random());
    const blogslist = shuffled.slice(0, 4);
res.status(200).json({
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
const getFeaturedblogsadmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // page number
    const limit = parseInt(req.query.limit) || 10; // per-page limit
    const { title } = req.query;

    // Build filter
    let filter = { featured: true }; 
    function escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    if (title) {
      const escapedTitle = escapeRegex(title);
      filter.title = { $regex: escapedTitle, $options: "i" };
    }

    // Fetch paginated blogs
    const allFeaturedBlogs = await Blogs.find(filter).populate("category")
      .select("-comments -detail -viewedBy  -isDeleted -faqSchema -metaDescription -updatedAt -__v")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    const totalBlogs = await Blogs.countDocuments(filter);
    res.status(200).json({
      blogs: allFeaturedBlogs,
      currentPage: page,
      limit,
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
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
    const { title } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let filter = { isDeleted: { $ne: true } }; // ✅ Exclude deleted blogs

    // Escape regex safely
    const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    if (title) {
      const escapedTitle = escapeRegex(title);
      filter.title = { $regex: escapedTitle, $options: "i" };
    }

    const blogslist = await Blogs.find(filter)
      .select("-comments -detail -viewedBy -isDeleted -faqSchema -featured -metaDescription -updatedAt -__v ")
      .sort({ createdAt: -1 })
      .populate({
        path: "category",
        model: "Category",
        select:"name "
      })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalBlogs = await Blogs.countDocuments(filter);

    return res.status(200).json({
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
      limit,
      blogs: blogslist,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};




const viewblog = async (req, res) => {
  try {
    const { slug } = req.params;
    let blog = await Blogs.findOne({ slug, published: true })
      .populate({
        path: "comments",
        match: { published: true },
        options: { sort: { createdAt: -1 } },
      })
      .populate("category");
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    blog = await Blogs.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate({
        path: "comments",
        match: { published: true },
        options: { sort: { createdAt: -1 } },
      })
      .populate("category");
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
    let blog = await Blogs.findById(id).populate({
        path: "category",
        model: "Category",
      });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const commentsCount = blog.comments ? blog.comments.length : 0;
    return res.status(200).json({
      message: "Blog fetched successfully",
      blog,
      status: 200,
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
const getblogSlugs = async (req, res) => {
  try {
    const blogslist = await Blogs.find({ published: true, isDeleted: false })
      .select("slug _id title")
      .sort({ publishedDate: -1 });

    const totalBlogs = await Blogs.countDocuments({ published: true ,  isDeleted: false});

    res.status(200).json({
      totalBlogs,
      slugs: blogslist,
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


const changeblogauther = async (req, res) => {
  try {
    const result = await Blogs.updateMany({}, { $set: { author: "Admin" } });

    res.status(200).json({
      status: 200,
      message: `${result.modifiedCount} blog authors updated to 'Admin'.`,
    });
  } catch (error) {
    console.error("Error updating blog authors:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getPopularBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5; 

    const blogs = await Blogs.find({ published: true, isDeleted: false })
      .select("-comments -detail -viewedBy -faqSchema -createdAt -updatedAt -isDeleted -__v -featured -published -views ") 
       .populate(
        "category",
        "name "
      )
      .sort({ views: -1 }) // sort by views (highest first)
      .limit(limit);

    res.status(200).json({
      status: 200,
      message: "Popular blogs fetched successfully",
      blogs,
    });
  } catch (error) {
    console.error("Error fetching popular blogs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


module.exports = {
  createblog,
  updateblog,
  listblog,
  viewblog,
  deletemultiblog,
  listblogAdmin,
  viewblogbyid,
  getblogSlugs,
  getFeaturedblogs,
  getFeaturedblogsadmin,
  changeblogauther,
  getPopularBlogs
  
};
