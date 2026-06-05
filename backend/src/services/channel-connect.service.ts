import type { Types } from "mongoose";

import { getSocialChannelLinks, isSocialChannelName, type SocialChannelName } from "../lib/social-channels.js";
import { Post } from "../models/Post.js";
import { WorkspaceSettings } from "../models/WorkspaceSettings.js";
import { serializeSettings } from "../utils/serializers.js";

export async function connectSocialChannel(userId: Types.ObjectId, channelName: string) {
  if (!isSocialChannelName(channelName)) {
    throw new Error(`Unknown channel: ${channelName}`);
  }

  const links = getSocialChannelLinks(channelName);
  const settings = await WorkspaceSettings.findOne({ userId });
  if (!settings) {
    throw new Error("Settings not found");
  }

  const channels = settings.channels.map((channel) =>
    channel.name === channelName
      ? { name: channel.name, connected: true }
      : { name: channel.name, connected: channel.connected },
  );

  if (!channels.some((channel) => channel.name === channelName)) {
    channels.push({ name: channelName, connected: true });
  }

  settings.set("channels", channels);
  await settings.save();

  const now = new Date();
  const publishResult = await Post.updateMany(
    {
      userId,
      status: "scheduled",
      channels: channelName,
    },
    {
      $set: {
        status: "published",
        scheduledAt: now,
      },
    },
  );

  return {
    channel: channelName,
    connectUrl: links.connectUrl,
    deployUrl: links.deployUrl,
    helpText: links.helpText,
    publishedCount: publishResult.modifiedCount,
    settings: serializeSettings(settings),
  };
}
