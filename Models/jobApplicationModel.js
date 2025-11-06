
const mongoose = require("mongoose");

const ApplicationsSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    },
    name: { type: String,  },
    email: { type: String,  },
    phone: { type: String,  },
    education: { type: String,  },
    basedInLahore: { type: Boolean,  },
    willingToRelocate: { type: Boolean,  },
    experience: { type: String,  },
    currentCompany: { type: String },
    university: { type: String },
    cgpa: { type: String },
    graduationYear: { type: String },
    linkedinProfile: { type: String },
    currentSalary: { type: String },
    expectedSalary: { type: String },
    resume: { type: String }, // file URL or path
    whyDoYouWantToSwitch: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);



const Applications = mongoose.model("Applications", ApplicationsSchema);

module.exports = Applications;