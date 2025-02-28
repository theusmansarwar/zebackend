const Team = require("../Models/teamsModel");
const TeamCategory =require("../Models/teamCategoryModel")
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






// Create a new team member
const createService = async (req, res) => {
    try {
      const { name, introduction,  slug, published } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;
  
      const missingFields = [];
      if (!name) missingFields.push({ name: "name", message: "Name is required" });
      if (!introduction) missingFields.push({ name: "introduction", message: "Introduction is required" });
      if (!slug) missingFields.push({ name: "slug", message: "Slug is required" });
      if (!image) missingFields.push({ name: "image", message: "Image is required" });
      if (missingFields.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "Some fields are missing!",
          missingFields,
        });
      }
      else{
        return res.status(200).json({
            status: 200,
            message: "Data is recorded",
           
        })
      }
  
   
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };



module.exports = {
    createService: [upload.single("image"), createService],
 
};
