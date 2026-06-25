import { FiAward, FiGlobe } from 'react-icons/fi';
import { FaLinkedin } from 'react-icons/fa';
import {
  SiBehance,
  SiBluesky,
  SiDiscord,
  SiDribbble,
  SiFacebook,
  SiGithub,
  SiGitlab,
  SiInstagram,
  SiMastodon,
  SiMedium,
  SiPinterest,
  SiReddit,
  SiSnapchat,
  SiSpotify,
  SiStackoverflow,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiTwitch,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from 'react-icons/si';

/**
 * Global registry of social / portfolio platforms (reuse anywhere: gigs, org pages, etc.).
 * Stable `platform` ids are stored in DB inside `social_links`.
 */
export const SOCIAL_PLATFORM_OPTIONS = [
  { platform: 'website', label: 'Website', placeholder: 'https://your-site.com', Icon: FiGlobe },
  { platform: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/…', Icon: SiFacebook },
  { platform: 'x', label: 'X (Twitter)', placeholder: 'https://x.com/…', Icon: SiX },
  { platform: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…', Icon: SiInstagram },
  { platform: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/…', Icon: FaLinkedin },
  { platform: 'github', label: 'GitHub', placeholder: 'https://github.com/…', Icon: SiGithub },
  { platform: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@…', Icon: SiYoutube },
  { platform: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@…', Icon: SiTiktok },
  { platform: 'threads', label: 'Threads', placeholder: 'https://threads.net/@…', Icon: SiThreads },
  { platform: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/923001234567', Icon: SiWhatsapp },
  { platform: 'telegram', label: 'Telegram', placeholder: 'https://t.me/…', Icon: SiTelegram },
  { platform: 'discord', label: 'Discord', placeholder: 'https://discord.com/users/…', Icon: SiDiscord },
  { platform: 'snapchat', label: 'Snapchat', placeholder: 'https://snapchat.com/add/…', Icon: SiSnapchat },
  { platform: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/…', Icon: SiPinterest },
  { platform: 'reddit', label: 'Reddit', placeholder: 'https://reddit.com/user/…', Icon: SiReddit },
  { platform: 'medium', label: 'Medium', placeholder: 'https://medium.com/@…', Icon: SiMedium },
  { platform: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/…', Icon: SiTwitch },
  { platform: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/user/…', Icon: SiSpotify },
  { platform: 'behance', label: 'Behance', placeholder: 'https://behance.net/…', Icon: SiBehance },
  { platform: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/…', Icon: SiDribbble },
  {
    platform: 'stackoverflow',
    label: 'Stack Overflow',
    placeholder: 'https://stackoverflow.com/users/…',
    Icon: SiStackoverflow,
  },
  { platform: 'gitlab', label: 'GitLab', placeholder: 'https://gitlab.com/…', Icon: SiGitlab },
  { platform: 'mastodon', label: 'Mastodon', placeholder: 'https://…', Icon: SiMastodon },
  { platform: 'bluesky', label: 'Bluesky', placeholder: 'https://bsky.app/profile/…', Icon: SiBluesky },
  /** Shown on profile when verification is approved — not edited in basic form */
  {
    platform: 'eventthon',
    label: 'EventThon profile',
    placeholder: '',
    Icon: FiAward,
  },
];

const PRESET_BY_PLATFORM = Object.fromEntries(SOCIAL_PLATFORM_OPTIONS.map((o) => [o.platform, o]));

export function getSocialPlatformMeta(platform) {
  const p = String(platform || '').toLowerCase();
  return PRESET_BY_PLATFORM[p] || SOCIAL_PLATFORM_OPTIONS[0];
}

export function newSocialLinkRow(platform = 'website') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    platform,
    url: '',
  };
}

/** Profile / ID verified enough to show public EventThon profile link */
export function isEventthonProfileLinkEligible(userData) {
  if (!userData || typeof userData !== 'object') return false;
  if (userData.verified === true) return true;
  if (userData.id_card_verified === true) return true;
  const st = String(userData.identity_status || '').toLowerCase();
  if (st === 'active' || st === 'approved' || st === 'verified') return true;
  return false;
}

/**
 * Shareable EventThon profile URL (same-origin; refine when public /u/:id routes exist).
 */
export function getEventthonProfileShareUrl(userData) {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : String(process.env.REACT_APP_PUBLIC_SITE_ORIGIN || '').replace(/\/+$/, '');
  if (!origin) return '';
  const id =
    userData?.user_id ||
    userData?.email ||
    userData?.mobile ||
    '';
  if (id) {
    const key = encodeURIComponent(String(id).trim());
    return `${origin}/profile?ref=${key}`;
  }
  return `${origin}/profile`;
}

export function buildAutoEventthonSocialLink(userData) {
  if (!isEventthonProfileLinkEligible(userData)) return null;
  const url = getEventthonProfileShareUrl(userData);
  if (!url) return null;
  return {
    id: 'eventthon-profile-auto',
    platform: 'eventthon',
    url,
  };
}

/** Public profile / header: up to 2 company website URLs + auto EventThon when verified */
export function mergeProfileSocialLinksForDisplay(userData) {
  if (!userData) return [];
  const raw = Array.isArray(userData.social_links) ? userData.social_links : [];
  let websites = raw
    .filter(
      (x) =>
        x &&
        String(x.platform || '').toLowerCase() === 'website' &&
        String(x.url || '').trim()
    )
    .map((x, i) => ({
      id: String(x.id || `website-${i}`),
      platform: 'website',
      url: String(x.url).trim(),
    }))
    .slice(0, 2);

  if (!websites.length && userData.link_website?.trim()) {
    websites = [
      {
        id: 'legacy-website',
        platform: 'website',
        url: userData.link_website.trim(),
      },
    ];
  }
  const auto = buildAutoEventthonSocialLink(userData);
  if (auto) return [...websites, auto];
  return websites;
}
