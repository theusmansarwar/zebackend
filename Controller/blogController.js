const Blogs = require("../Models/blogModel");
const multer = require("multer");
const path = require("path");

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Save files in 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed!"), false);
    }
};

// Multer Upload Middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

// ✅ Create Blog API
const createblog = async (req, res) => {
    try {
        const { title, description, detail, author } = req.body;
        const thumbnail = req.file ? req.file.path : null; 

        if (!title || !description || !detail || !author || !thumbnail) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newBlog = await Blogs.create({
            title,
            description,
            detail,
            author,
            thumbnail,
        });

       
        res.status(201).json({ message: "Blog created successfully", blog: newBlog });

    } catch (error) {
        res.status(500).json({ message: "Error creating blog", error: error.message });
    }
};

// Other functions (empty for now)
const updateblog = async (req, res) => {};
const deleteblog = async (req, res) => {};
const listblog = async (req, res) => {};
const viewblog = async (req, res) => {};

module.exports = {
    createblog: [upload.single("thumbnail"), createblog], // Multer middleware
    updateblog,
    deleteblog,
    listblog,
    viewblog,
};
