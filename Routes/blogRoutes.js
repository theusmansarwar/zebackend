const express = require("express");
const router = express.Router();

const {
  createblog,
  updateblog,
  listblog,
  viewblog,
  deletemultiblog,
  listblogAdmin,
  viewblogbyid,
  getblogSlugs,
  getFeaturedblogs,
  getFeaturedblogsadmin,
  changeblogauther,
  getPopularBlogs,
} = require("../Controller/blogController");

router.post("/create", createblog);
router.put("/update/:id", updateblog);
router.delete("/deleteMultiple", deletemultiblog);
router.get("/view/:slug", viewblog);
router.get("/viewbyid/:id", viewblogbyid);
router.get("/list", listblog);
router.get("/sluglist", getblogSlugs);
router.get("/adminlist", listblogAdmin);
router.get("/featured", getFeaturedblogs);
router.get("/featuredAdmin", getFeaturedblogsadmin);
router.get("/changeblogauther", changeblogauther);
router.get("/popular", getPopularBlogs);

module.exports = router;
