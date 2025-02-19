require('dotenv').config();
const cors = require("cors");
const express=require("express");
const app= express();
app.use(cors());

const connectDB= require("./utils/db");
const  userRouter  = require('./Routes/userRoutes');
const path = require('path')
const port=5000;
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

app.use("/api", userRouter)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files


connectDB().then(()=>{
    app.listen(port,()=>{
        console.log("Server is running on Port: ", port)
    })
})