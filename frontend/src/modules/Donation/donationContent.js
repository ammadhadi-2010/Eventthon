import {
  DONATION_COMMITMENTS,
  DONATION_HERO_FEATURES,
  DONATION_IMAGES,
  DONATION_PRESET_AMOUNTS,
  DONATION_STEPS,
} from './donationData';
import { resolveDonationIcon } from './donationIconMap';
import { resolveMediaUrl } from '../../components/shared/utils/resolveMediaUrl';

const FEATURE_ICON_KEYS = ['users', 'shield', 'gift'];
const COMMITMENT_ICON_KEYS = ['shield', 'heart', 'gift'];

export const DEFAULT_DONATION_SETTINGS = {
  heroTitle: 'Give Sadaqah, Earn Rewards, Make a Lasting Impact',
  heroSubtitle: 'Support verified organizations and be part of goodness that changes lives.',
  heroImageUrl: DONATION_IMAGES.hero,
  profitPledgePercent: 12,
  feedCardEnabled: true,
  feedCardTitle: 'Support a Cause',
  feedCardSubtitle: 'Donate to verified organizations through EventThon. 12% of our net profits support community initiatives.',
  presetAmounts: DONATION_PRESET_AMOUNTS,
  rewardTitle: 'Small Act, Big Reward',
  rewardSubtitle: 'Every act of giving brings countless blessings.',
  rewardImageUrl: DONATION_IMAGES.reward,
    inviteTitle: 'Invite Others, Spread Goodness',
    inviteSubtitle: 'Share EventThon Donate with friends and grow the circle of giving.',
    inviteLink: '/',
    learnMoreTitle: 'About EventThon Donate',
    learnMoreSubtitle: 'Giving with trust, transparency, and lasting community impact.',
    learnMoreIntro: 'EventThon Donate connects members with verified charitable organizations across education, healthcare, food relief, and emergency support. Every organization is reviewed before appearing on the platform.',
    learnMoreImageUrl: '',
    learnMoreSections: [
      { title: 'Our Mission', text: 'We make it simple to discover trustworthy causes and support them through verified partners — while earning platform rewards for spreading goodness.' },
      { title: 'Verified Organizations Only', text: 'Each NGO and charity on EventThon Donate is reviewed for legitimacy, active programs, and a clear public donation channel before going live.' },
      { title: 'Transparent Giving', text: 'You choose the organization and amount in Thon. We log your intent and redirect you to the official partner website to complete your donation securely.' },
      { title: 'Community Pledge', text: 'EventThon commits a share of net profits to verified charitable initiatives, amplifying the impact of our community over time.' },
    ],
    heroFeatures: DONATION_HERO_FEATURES.map((row, index) => ({
    iconKey: FEATURE_ICON_KEYS[index] || 'heart',
    text: row.text,
  })),
  steps: DONATION_STEPS.map(({ title, text }) => ({ title, text })),
  commitments: DONATION_COMMITMENTS.map((row, index) => ({
    iconKey: COMMITMENT_ICON_KEYS[index] || 'heart',
    title: row.title,
    text: row.text,
  })),
};

function withPercent(text = '', percent = 12) {
  return String(text || '').replaceAll('{percent}', String(percent));
}

export function mergeDonationSettings(settings = {}) {
  const merged = { ...DEFAULT_DONATION_SETTINGS, ...(settings || {}) };
  const percent = merged.profitPledgePercent ?? 12;
  merged.feedCardSubtitle = withPercent(merged.feedCardSubtitle, percent);
  merged.heroFeatures = (merged.heroFeatures?.length ? merged.heroFeatures : DEFAULT_DONATION_SETTINGS.heroFeatures);
  merged.steps = (merged.steps?.length ? merged.steps : DEFAULT_DONATION_SETTINGS.steps);
  merged.commitments = (merged.commitments?.length ? merged.commitments : DEFAULT_DONATION_SETTINGS.commitments).map(
    (row) => ({
      ...row,
      title: withPercent(row.title, percent),
      text: withPercent(row.text, percent),
    }),
  );
  merged.learnMoreSections = (merged.learnMoreSections?.length ? merged.learnMoreSections : DEFAULT_DONATION_SETTINGS.learnMoreSections).map(
    (row) => ({
      ...row,
      title: withPercent(row.title, percent),
      text: withPercent(row.text, percent),
    }),
  );
  return merged;
}

export function resolveHeroFeatures(settings) {
  return (settings?.heroFeatures || DEFAULT_DONATION_SETTINGS.heroFeatures).map((row) => ({
    Icon: resolveDonationIcon(row.iconKey),
    text: row.text,
  }));
}

export function resolveSteps(settings) {
  return settings?.steps?.length ? settings.steps : DEFAULT_DONATION_SETTINGS.steps;
}

export function resolveCommitments(settings) {
  const percent = settings?.profitPledgePercent ?? 12;
  const rows = settings?.commitments?.length ? settings.commitments : DEFAULT_DONATION_SETTINGS.commitments;
  return rows.map((row) => ({
    Icon: resolveDonationIcon(row.iconKey),
    title: withPercent(row.title, percent),
    text: withPercent(row.text, percent),
  }));
}

export function resolveDonationImages(settings) {
  const hero = settings?.heroImageUrl || DONATION_IMAGES.hero;
  const reward = settings?.rewardImageUrl || DONATION_IMAGES.reward;
  return {
    hero: resolveMediaUrl(hero) || hero,
    reward: resolveMediaUrl(reward) || reward,
  };
}

export function resolveLearnMoreContent(settings) {
  const merged = mergeDonationSettings(settings);
  const percent = merged.profitPledgePercent ?? 12;
  const imageRaw = merged.learnMoreImageUrl || merged.heroImageUrl || DONATION_IMAGES.hero;
  const sections = (merged.learnMoreSections?.length ? merged.learnMoreSections : DEFAULT_DONATION_SETTINGS.learnMoreSections).map(
    (row) => ({
      title: withPercent(row.title, percent),
      text: withPercent(row.text, percent),
    }),
  );
  return {
    title: merged.learnMoreTitle || DEFAULT_DONATION_SETTINGS.learnMoreTitle,
    subtitle: withPercent(merged.learnMoreSubtitle, percent),
    intro: withPercent(merged.learnMoreIntro, percent),
    imageUrl: imageRaw ? resolveMediaUrl(imageRaw) || imageRaw : '',
    sections,
  };
}
