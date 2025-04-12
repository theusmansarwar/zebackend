
const mongoose = require('mongoose');
const LeadsSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: true
  },
  query: {
    type: String,
    required: true,
  
  },

 
}, {
  timestamps: true 
});



const Leads = mongoose.model('PolutosecLeads', LeadsSchema);

module.exports = Leads;
