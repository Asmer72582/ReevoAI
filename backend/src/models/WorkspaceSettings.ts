import mongoose, { Schema, type InferSchemaType } from "mongoose";

const channelSchema = new Schema(
  {
    name: { type: String, required: true },
    connected: { type: Boolean, default: false },
  },
  { _id: false },
);

const workspaceSettingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    brandName: { type: String, default: "ReevoAI" },
    brandVoice: {
      type: String,
      default: "Confident, friendly, slightly witty. Short sentences. Customer-first.",
    },
    defaultHashtags: { type: String, default: "#SaaS #CustomerLove #ReevoAI" },
    autoPublisher: { type: Boolean, default: true },
    channels: { type: [channelSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export type WorkspaceSettingsDocument = InferSchemaType<typeof workspaceSettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WorkspaceSettings = mongoose.model("WorkspaceSettings", workspaceSettingsSchema);
