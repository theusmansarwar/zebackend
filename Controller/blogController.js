const Blogs = require("../Models/blogModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


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
    }
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
        console.log("FormData received:", req.body);

        const { title, description, detail, author, tags, metaDescription, slug } = req.body;
        const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;

        const missingFields = [];

        if (!title) missingFields.push({ name: "title", message: "Title is required" });
        if (!description) missingFields.push({ name: "description", message: "Description is required" });
        if (!detail) missingFields.push({ name: "detail", message: "Detail is required" });
        if (!author) missingFields.push({ name: "author", message: "Author is required" });
        if (!tags) missingFields.push({ name: "tags", message: "Tags are required" });
        if (!metaDescription) missingFields.push({ name: "metaDescription", message: "Meta description is required" });
        if (!slug) missingFields.push({ name: "slug", message: "Slug is required" });
        if (!thumbnail) missingFields.push({ name: "thumbnail", message: "Thumbnail (image) is required" });

        if (missingFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Some fields are missing!",
                missingFields,
            });
        }

        // Ensure `tags` is an array
        const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(",").map(tag => tag.trim()) : []);

        const newBlog = await Blogs.create({
            title,
            description,
            detail,
            author,
            slug,
            thumbnail,
            tags: tagsArray,
            metaDescription
        });

        res.status(201).json({ message: "Blog created successfully", blog: newBlog });

    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Other functions (empty for now)
const updateblog = async (req, res) => {};
const deleteblog = async (req, res) => {};


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
        res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
};





const viewblog = async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await Blogs.findOne({slug}).populate("comments");

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
      
        const approvedComments = blog.comments
            .filter(comment => comment.published)
            .map(({ _id, name, email, comment, createdAt }) => ({
                _id,
                name,
                email,
                comment,
                createdAt
            }));
        res.status(200).json({ ...blog.toObject(), comments: approvedComments });

    } catch (error) {
        console.error("Error viewing blog:", error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    createblog: [upload.single("thumbnail"), createblog],
    updateblog,
    deleteblog,
    listblog,
    viewblog,
};
