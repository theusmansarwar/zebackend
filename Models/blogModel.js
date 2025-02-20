
const mongoose = require('mongoose');
const BlogsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
 
  description: {
    type: String,
    required: true,
   
  },
  detail: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  }

 
}, {
  timestamps: true 
});



const Blogs = mongoose.model('Blogs', BlogsSchema);

module.exports = Blogs;