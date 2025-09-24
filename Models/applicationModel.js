
const mongoose = require('mongoose');
const ApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
 
  email: {
    type: String,
    required: true,
   
  },
  phone: {
    type: String,
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  resume: {
    type: String, 
    required: true,
  },

 
}, {
  timestamps: true 
});



const Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;
