import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SavedCreatorSchema = new Schema(
  {
    userEmail: { type: String, required: true, index: true },
    creatorUsername: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness per user and creator
SavedCreatorSchema.index({ userEmail: 1, creatorUsername: 1 }, { unique: true });

export default mongoose.models.SavedCreator ||
  model("SavedCreator", SavedCreatorSchema);
