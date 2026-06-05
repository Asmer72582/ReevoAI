import mongoose, { Schema, type InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    source: { type: String, required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    tag: { type: String, required: true },
    images: { type: [String], default: [] },
    reelVideoUrl: { type: String, default: "" },
    reelScript: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & { _id: mongoose.Types.ObjectId };

export const Review = mongoose.model("Review", reviewSchema);
