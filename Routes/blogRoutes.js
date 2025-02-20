const express = require("express");
const router = express.Router();
const upload= require("../Middleware/Multer")
const { 
    createblog,
    updateblog,
    deleteblog,
    listblog,
    viewblog 
} = require("../Controller/blogController");



router.post('/create', createblog);
router.post('/update', updateblog);
router.post('/delete', deleteblog);
router.post('/view', listblog);
router.post('/list', viewblog);


module.exports = router;