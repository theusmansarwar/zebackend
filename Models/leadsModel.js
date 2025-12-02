
const mongoose = require('mongoose');
const LeadsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  lastName: {
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
  hasWebsite: {
    type: String,
  },
  website: {
    type: String,
  },
  subject: {
    type: String,
    required: true
  },
  
  query: {
    type: String,
    required: true,
  
  },
 isDeleted: { type: Boolean, default: false },
 
}, {
  timestamps: true 
});



const Leads = mongoose.model('Leads', LeadsSchema);

module.exports = Leads;
