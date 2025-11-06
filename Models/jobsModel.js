import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    jobtitle: { type: String, required: true },
    description: { type: String, required: true },
    noofyearsexperience: { type: Number, required: true },
    jobtype: { type: String, required: true }, // e.g. Full-time, Part-time, Remote
    location: { type: String, required: true },
    WorkingDaysSchema: {
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false },
      monday: { type: Boolean, default: false },
      tuesday: { type: Boolean, default: false },
      wednesday: { type: Boolean, default: false },
      thursday: { type: Boolean, default: false },
      friday: { type: Boolean, default: false },
    },
    noofvacancies: { type: Number, required: true },
    officetiming: { type: String, required: true },
    lastdatetoapply: { type: Date, required: true },
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

const Jobs = mongoose.model("Job", JobSchema);

export default Jobs;
