const mongoose = require("mongoose");

const BlogsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
      required: true,
      maxlength: 160,
    },

    slug: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
  
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    views: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Blogs = mongoose.model("Blogs", BlogsSchema);

module.exports = Blogs;
