const express = require("express");
const router = express.Router();

const { 
    createblog,
    updateblog,
    deleteblog,
    listblog,
    viewblog, 
    deletemultiblog
} = require("../Controller/blogController");



router.post('/create', createblog);
router.put('/update/:id', updateblog);
router.delete('/delete/:id', deleteblog);
router.delete('/deleteMultiple', deletemultiblog);
router.get('/view/:slug', viewblog);
router.get('/list', listblog);




module.exports = router;