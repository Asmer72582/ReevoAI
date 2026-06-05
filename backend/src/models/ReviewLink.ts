import mongoose, { Schema, type InferSchemaType } from "mongoose";

const reviewLinkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    token: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true },
    label: { type: String, default: "Customer review link" },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export type ReviewLinkDocument = InferSchemaType<typeof reviewLinkSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ReviewLink = mongoose.model("ReviewLink", reviewLinkSchema);
