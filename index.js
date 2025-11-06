require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const connectDB = require("./utils/db");

const app = express();
const port = process.env.PORT || 4000;

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:3000", // Local frontend (React)
  "http://localhost:5173",  // Local frontend (Vite)
  "https://admin.zemalt.com", // Admin panel (Live)
  "https://zemalt.com",
  "https://www.zemalt.com" ,
  "http://localhost:3001",
  "https://creators-time.blogspot.com" ,
  "https://creators-time.blogspot.com/"  ,
  "https://plutosec.ca/",
  "https://ztesting.site",
  "https://plutosec.ca/*",
  "https://next-sable-theta.vercel.app/",
  
    // Main Website (Live)
];

// ✅ Apply CORS Middleware Before Routes
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin"));
    }
  },
  credentials: true, // Allow cookies/auth headers
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
}));

// ✅ Handle Preflight Requests
app.options("*", cors()); // Allow all OPTIONS requests

// ✅ Middleware
app.use(express.json());

// ✅ Routes
const userRouter = require("./Routes/userRoutes");
const blogRouter = require("./Routes/blogRoutes");
const commentRouter = require("./Routes/commentRoutes");
const categoryRouter = require("./Routes/categoryRoutes");
const teamRouter = require("./Routes/teamRoutes");
const TeamCategoryRouter = require("./Routes/teamCategoryRoutes");
const roleRouter = require("./Routes/roleRoutes");
const testimonialRouter = require("./Routes/testimonialRoutes");
const serviceRouter = require("./Routes/serviceRoutes");

const subserviceRouter = require("./Routes/subServiceRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const viewsRouter = require("./Routes/viewsRoutes");
const usertypeRouter = require("./Routes/typeRoutes");
const industryRoutes = require("./Routes/industriesRoutes");
const caseStudyRoutes = require("./Routes/caseStudiesRoutes");

const jobsRoutes = require("./Routes/jobRoutes");
const productRoutes = require("./Routes/productsRoutes");

const PortfolioRoutes = require("./Routes/portfolioRoutes");
const faqsRoutes = require("./Routes/faqsRoutes");
const provenStepsRoutes = require("./Routes/ProvenStepsRoutes");

const ApplicationRoutes = require("./Routes/applicationRoutes");
// ✅ Use Routes
app.use("/", userRouter);
app.use("/usertype", usertypeRouter);
app.use("/admin", adminRoutes);
app.use("/blog", blogRouter);
app.use("/comment", commentRouter);
app.use("/category", categoryRouter);
app.use("/teamcategory", TeamCategoryRouter);
app.use("/team", teamRouter);
app.use("/service", serviceRouter);
app.use("/sub-service", subserviceRouter);
app.use("/testimonial", testimonialRouter);
app.use("/role", roleRouter);
app.use("/views", viewsRouter);
app.use("/industry", industryRoutes);
app.use("/casestudy", caseStudyRoutes);
app.use("/jobs", jobsRoutes);
app.use("/product", productRoutes);
app.use("/faqs", faqsRoutes);
app.use("/provenSteps", provenStepsRoutes);
app.use("/portfolio", PortfolioRoutes);

app.use("/applications", ApplicationRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const multer = require("multer");
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
});

// after all routes
app.use((err, req, res, next) => {
  console.error("Error middleware caught:", err);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      status: 413,
      message: "File too large! Please upload smaller files.",
    });
  }

  // Body size exceeded (express / nginx)
  if (err.status === 413) {
    return res.status(413).json({
      status: 413,
      message: "Request entity too large! Please reduce file size or request payload.",
    });
  }

  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
});

app.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    file:fileUrl,
    isSuccess: true,
    messages: ["Image uploaded successfully"],
  });
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on Port: ${port}`);
  });
});