const Team = require("../Models/teamsModel");
const TeamCategory = require("../Models/teamCategoryModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Role = require("../Models/roleModel");

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

const createService = async (req, res) => {
  try {
    const { name, introduction, slug, published } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const missingFields = [];
    if (!name)
      missingFields.push({ name: "name", message: "Name is required" });
    if (!introduction)
      missingFields.push({ name: "introduction", message: "Introduction is required" });
    if (!slug)
      missingFields.push({ name: "slug", message: "Slug is required" });
    if (!image)
      missingFields.push({ name: "image", message: "Image is required" });
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    // Fetch category by ID
    const categoryExists = await TeamCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      return res.status(400).json({ message: "Invalid role ID" });
    }
    // Parse social links (handle JSON parsing safely)
    let parsedSocialLinks = {};
    try {
      parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : {};
    } catch (error) {
      return res.status(400).json({ message: "Invalid socialLinks format" });
    }

    // Create new team member
    const newMember = await Team.create({
      name,
      slug,
      introduction,
      image,
      
      published: published === "true" || published === true, // Ensure boolean conversion
    });

    res
      .status(201)
      .json({
        status: 200,
        message: "Team member created successfully",
        member: newMember,
      });
  } catch (error) {
    console.error("Error creating team member:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};



module.exports = {
  createService: [upload.single("image"), createService],
 
};
