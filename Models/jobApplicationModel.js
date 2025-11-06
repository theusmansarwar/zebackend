import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    education: { type: String, required: true },
    basedInLahore: { type: Boolean, required: true },
    willingToRelocate: { type: Boolean, required: true },
    experience: { type: String, required: true },
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


const Applications = mongoose.model("Applications", ApplicationSchema);

export default Applications;
