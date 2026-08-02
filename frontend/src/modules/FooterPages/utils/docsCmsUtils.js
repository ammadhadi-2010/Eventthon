import {
  DOC_ACCOUNT_STEPS,
  DOC_FEATURES,
  DOC_NAV,
  DOC_PAGES,
  DOC_PROFILE_CHECKS,
  DOC_UPDATED,
} from '../data/documentationData';
import { splitMarkdownSections } from './companyFooterMappers';

export const DOC_TOPIC_OPTIONS = DOC_NAV.filter((item) => DOC_PAGES[item.id]);

function lines(text) {
  return String(text || '')
    .split(/\n/)
    .map((l) => l.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

function sectionBody(parsed, key) {
  return String(parsed[key] || '').trim();
}

/** Regular topic: ## body + optional ## code */
export function serializeDocTopic({ body = '', code = '' } = {}) {
  const parts = [`## body`, String(body || '').trim()];
  if (String(code || '').trim()) parts.push(`## code`, String(code).trim());
  return parts.join('\n');
}

export function parseDocTopic(content) {
  const text = String(content || '').trim();
  if (!text) return { body: '', code: '' };
  if (!/^## /m.test(text)) {
    const fence = text.match(/```[\w]*\n?([\s\S]*?)```/);
    if (fence) {
      return {
        body: text.replace(/```[\w]*\n?[\s\S]*?```/, '').trim(),
        code: fence[1].trim(),
      };
    }
    return { body: text, code: '' };
  }
  const parsed = splitMarkdownSections(text);
  return {
    body: sectionBody(parsed, 'body') || sectionBody(parsed, '_body'),
    code: sectionBody(parsed, 'code'),
  };
}

/** Quick Start structured blocks */
export function serializeQuickStart(data = {}) {
  const features = (data.features || []).map((f) => (typeof f === 'string' ? f : f.label)).filter(Boolean);
  return [
    '## callout',
    data.callout || '',
    '## what',
    data.whatBody || '',
    '## features',
    features.join('\n'),
    '## account-steps',
    (data.accountSteps || []).join('\n'),
    '## profile-checks',
    (data.profileChecks || []).join('\n'),
    '## next',
    data.nextBody || '',
  ].join('\n');
}

export function parseQuickStart(content) {
  const parsed = splitMarkdownSections(content);
  const featureLines = lines(sectionBody(parsed, 'features'));
  return {
    callout: sectionBody(parsed, 'callout'),
    whatBody: sectionBody(parsed, 'what'),
    features: featureLines.length
      ? featureLines.map((label, i) => ({ id: `f-${i}`, label }))
      : DOC_FEATURES,
    accountSteps: lines(sectionBody(parsed, 'account-steps')),
    profileChecks: lines(sectionBody(parsed, 'profile-checks')),
    nextBody: sectionBody(parsed, 'next'),
  };
}

export function defaultDocFormForTopic(topicId = 'getting-started') {
  const page = DOC_PAGES[topicId] || DOC_PAGES['getting-started'];
  const label = DOC_TOPIC_OPTIONS.find((t) => t.id === topicId)?.label || page.title;
  const order = Math.max(0, DOC_TOPIC_OPTIONS.findIndex((t) => t.id === topicId));

  if (page.kind === 'quickstart') {
    return {
      title: label,
      pricingLabel: 'getting-started',
      excerpt: page.intro || '',
      readTime: DOC_UPDATED,
      sidebarOrder: 0,
      content: serializeQuickStart({
        callout: page.callout,
        whatBody:
          'EventThon Network is the workspace for creators and companies — squads, projects, gigs, jobs, Thon rewards, and donations in one place.',
        features: DOC_FEATURES,
        accountSteps: DOC_ACCOUNT_STEPS,
        profileChecks: DOC_PROFILE_CHECKS,
        nextBody:
          'Explore Guides, try a tutorial, or join Community when you are ready to ship with a squad.',
      }),
    };
  }

  return {
    title: label,
    pricingLabel: topicId,
    excerpt: page.intro || '',
    readTime: DOC_UPDATED,
    sidebarOrder: order,
    content: serializeDocTopic({ body: page.body || '', code: page.code || '' }),
  };
}

export function isQuickStartTopic(topicId, formData = {}) {
  const id = String(topicId || formData.pricingLabel || '').trim();
  return id === 'getting-started' || formData.title === 'Getting Started';
}
