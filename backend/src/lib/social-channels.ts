export type SocialChannelName = "Instagram" | "Facebook" | "LinkedIn" | "YouTube" | "X";

export type SocialChannelLinks = {
  name: SocialChannelName;
  connectUrl: string;
  deployUrl: string;
  helpText: string;
};

const CHANNEL_LINKS: Record<SocialChannelName, Omit<SocialChannelLinks, "name">> = {
  Instagram: {
    connectUrl: "https://business.facebook.com/latest/settings/instagram_account",
    deployUrl: "https://www.instagram.com/",
    helpText: "Connect your Instagram Business account via Meta Business Suite.",
  },
  Facebook: {
    connectUrl: "https://www.facebook.com/pages/creation/",
    deployUrl: "https://www.facebook.com/",
    helpText: "Create or connect a Facebook Page for publishing.",
  },
  LinkedIn: {
    connectUrl: "https://www.linkedin.com/company/setup/new/",
    deployUrl: "https://www.linkedin.com/feed/",
    helpText: "Set up your LinkedIn Company Page to publish posts.",
  },
  YouTube: {
    connectUrl: "https://studio.youtube.com/",
    deployUrl: "https://studio.youtube.com/",
    helpText: "Open YouTube Studio to connect your channel and upload videos.",
  },
  X: {
    connectUrl: "https://x.com/settings/connected_apps",
    deployUrl: "https://x.com/compose/post",
    helpText: "Authorize ReevoAI from X connected apps, then compose posts.",
  },
};

export const SOCIAL_CHANNEL_NAMES = Object.keys(CHANNEL_LINKS) as SocialChannelName[];

export function isSocialChannelName(name: string): name is SocialChannelName {
  return name in CHANNEL_LINKS;
}

export function getSocialChannelLinks(name: SocialChannelName): SocialChannelLinks {
  return { name, ...CHANNEL_LINKS[name] };
}

export function listSocialChannelLinks(): SocialChannelLinks[] {
  return SOCIAL_CHANNEL_NAMES.map(getSocialChannelLinks);
}
