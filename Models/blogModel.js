const mongoose = require("mongoose");

const BlogsSchema = new mongoose.Schema(
  {
    title: { type: String },
    category: {
      _id: { type: mongoose.Schema.Types.ObjectId,  ref: "Category" },
      name: { type: String,  }
    },
    description: { type: String,  },
    metaDescription: { type: String,  maxlength: 160 , trim: true},
    slug: { type: String,  },
    detail: { type: String,  },
     faqSchema: { type: String,  },
    author: { type: String,  },
    thumbnail: { type: String,  },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    views: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    publishedDate: { type: String,  },
    viewedBy: [{ type: String }],
    
  },
  { timestamps: true }
);

const Blogs = mongoose.model("Blogs", BlogsSchema);
module.exports = Blogs;
