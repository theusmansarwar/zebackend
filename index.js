require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const connectDB = require("./utils/db");

const app = express();
const port = process.env.PORT || 4000;

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",  // Local frontend (React)
  "http://localhost:5173",  // Local frontend (Vite)
  "https://admin.zemalt.com", // Admin panel (Live)
  "https://zemalt.com",
  "https://www.zemalt.com" ,
  "http://localhost:3001",
  "https://creators-time.blogspot.com" ,
  "https://creators-time.blogspot.com/"  ,
  "https://plutosec.ca/",
  "https://plutosec.ca",,
  "https://plutosec.ca/*",
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
const adminRoutes = require("./Routes/adminRoutes");
const viewsRouter = require("./Routes/viewsRoutes");
const polutosecRouter= require("./Routes/polutosecRoutes");

// ✅ Use Routes
app.use("/", userRouter);
app.use("/plutosec", polutosecRouter);
app.use("/admin", adminRoutes);
app.use("/blog", blogRouter);
app.use("/comment", commentRouter);
app.use("/category", categoryRouter);
app.use("/teamcategory", TeamCategoryRouter);
app.use("/team", teamRouter);
app.use("/service", serviceRouter);
app.use("/testimonial", testimonialRouter);
app.use("/role", roleRouter);
app.use("/views", viewsRouter);

// ✅ Static Folder for Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Database Connection & Server Start
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server is running on Port: ${port}`);
  });
});
