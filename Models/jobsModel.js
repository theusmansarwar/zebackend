const mongoose = require("mongoose");
const JobSchema = new mongoose.Schema(
  {
    jobtitle: { type: String,  },
    description: { type: String,  },
    
    jobCategory: { type: String,  },
    noofyearsexperience: { type: String,  },
    jobtype: { type: String,  }, // e.g. Full-time, Part-time, Remote
    location: { type: String,  },
    WorkingDaysSchema: {
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false },
      monday: { type: Boolean, default: false },
      tuesday: { type: Boolean, default: false },
      wednesday: { type: Boolean, default: false },
      thursday: { type: Boolean, default: false },
      friday: { type: Boolean, default: false },
    },
    noofvacancies: { type: String,  },
    officetiming: { type: String,  },
    lastdatetoapply: { type: Date,  },
    isPublished: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Applications",
      },
    ],
  },
  { timestamps: true }
);

const Jobs = mongoose.model("Jobs", JobSchema);

module.exports = Jobs;
