require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const connectDB = require("./utils/db");

const app = express();
const port = process.env.PORT || 4000;

// ✅ Allowed Origins (Local & Live)
const allowedOrigins = [
  "http://localhost:3000",  // Local frontend
  "http://localhost:5173",  // Local Vite frontend (if using Vite)
  "https://admin.zemalt.com", // Admin Panel (Live)
  "https://zemalt.com"       // Main Website (Live)
];

// ✅ CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

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

// ✅ Route Usage
app.use("/", userRouter);
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
