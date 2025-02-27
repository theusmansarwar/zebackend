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
const path = require('path');
const TeamCategoryRoutes = require('./Routes/teamCategoryRoutes');
const port=process.env.PORT || 4000;
app.use(express.json());
app.use(cors());

app.use("/", userRouter)

app.use("/blog", blogRouter)
app.use("/comment", commentRouter)
app.use("/category", categoryRouter)
app.use("/teamcategory", TeamCategoryRoutes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


connectDB().then(()=>{
    app.listen(port,()=>{
        console.log("Server is running on Port: ", port)
    })
})