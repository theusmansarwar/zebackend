const express = require("express");
const router = express.Router();

const { 
    createblog,
    updateblog,
    deleteblog,
    listblog,
    viewblog, 

} = require("../Controller/blogController");



router.post('/create', createblog);
router.post('/update', updateblog);
router.post('/delete', deleteblog);
router.get('/view/:slug', viewblog);
router.get('/list', listblog);




module.exports = router;