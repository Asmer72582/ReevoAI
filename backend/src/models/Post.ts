import mongoose, { Schema, type InferSchemaType } from "mongoose";

const postSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    channels: { type: [String], default: ["Instagram"] },
    status: {
      type: String,
      enum: ["scheduled", "published", "draft"],
      default: "draft",
    },
    scheduledAt: { type: Date, default: null },
    reviewId: { type: Schema.Types.ObjectId, ref: "Review", default: null, index: true },
    reviewName: { type: String, default: "" },
    reviewStars: { type: Number, default: null },
    imageUrl: { type: String, default: "" },
    imageUrls: { type: [String], default: [] },
    reviewText: { type: String, default: "" },
    imageSource: { type: String, enum: ["review", "poster", "gemini", ""], default: "" },
    aiSource: { type: String, enum: ["gemini", "fallback", ""], default: "" },
    videoUrl: { type: String, default: "" },
    reelScript: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type PostDocument = InferSchemaType<typeof postSchema> & { _id: mongoose.Types.ObjectId };

export const Post = mongoose.model("Post", postSchema);
