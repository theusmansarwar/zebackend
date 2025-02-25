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



router.post('/create', createblog);
router.put('/update/:id', updateblog);
router.delete('/delete/:id', deleteblog);
router.delete('/deleteMultiple', deletemultiblog);
router.get('/view/:slug', viewblog);
router.get('/viewbyid/:id', viewblogbyid);
router.get('/list', listblog);
router.get('/adminlist', listblogAdmin);




module.exports = router;