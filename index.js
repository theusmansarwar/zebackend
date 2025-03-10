require('dotenv').config();
const cors = require("cors");
const express=require("express");
const app= express();
app.use(cors());

const connectDB= require("./utils/db");
const  userRouter  = require('./Routes/userRoutes');
const  blogRouter  = require('./Routes/blogRoutes');
const  commentRouter  = require('./Routes/commentRoutes');
const  categoryRouter  = require('./Routes/categoryRoutes');
const  teamRouter  = require('./Routes/teamRoutes');
const TeamCategoryRouter = require('./Routes/teamCategoryRoutes');
const roleRouter = require('./Routes/roleRoutes');
const testimonialRouter = require('./Routes/testimonialRoutes');
const serviceRouter = require('./Routes/serviceRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const path = require('path');

const port=process.env.PORT || 4000;

const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3001","https://zemalt.com", "https://www.zemalt.com"], // Allow frontend on these ports
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies and auth headers
  };
  
  app.use(cors(corsOptions));
  app.use(express.json());
app.use("/", userRouter)
app.use("/admin", adminRoutes)
app.use("/blog", blogRouter)
app.use("/comment", commentRouter)
app.use("/category", categoryRouter)
app.use("/teamcategory", TeamCategoryRouter)
app.use("/team", teamRouter)
app.use("/service", serviceRouter)
app.use("/testimonial", testimonialRouter)
app.use("/role", roleRouter)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


connectDB().then(()=>{
    app.listen(port,()=>{
        console.log("Server is running on Port: ", port)
    })
})