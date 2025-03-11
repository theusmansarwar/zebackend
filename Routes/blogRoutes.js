const express = require("express");
const router = express.Router();

const { 
    createblog,
    updateblog,
    deleteblog,
    listblog,
    viewblog, 
    deletemultiblog,
    listblogAdmin,
    viewblogbyid
} = require("../Controller/blogController");
const authMiddleware = require("../Middleware/authMiddleware");



router.post('/create',authMiddleware, createblog);
router.put('/update/:id',authMiddleware, updateblog);
router.delete('/delete/:id',authMiddleware, deleteblog);
router.delete('/deleteMultiple',authMiddleware, deletemultiblog);
router.get('/view/:slug', viewblog);
router.get('/viewbyid/:id',authMiddleware, viewblogbyid);
router.get('/list', listblog);
router.get('/adminlist',authMiddleware, listblogAdmin);




module.exports = router;