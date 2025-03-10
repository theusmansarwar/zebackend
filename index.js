require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();

const connectDB = require("./utils/db");
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
const path = require("path");

const port = process.env.PORT || 4000;

// ✅ Fix: CORS Configuration (Including Remote Domain)
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://zemalt.com",
    "https://www.zemalt.com"
  ], 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies and auth headers
};

// ✅ Fix: Apply CORS Before Other Middleware
app.use(cors(corsOptions));

// ✅ Fix: Ensure CORS Headers Are Present in All Responses
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json());

// ✅ API Routes
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

// ✅ Serve Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Connect to DB and Start Server
connectDB().then(() => {
  app.listen(port, () => {
    console.log("Server is running on Port:", port);
  });
});
