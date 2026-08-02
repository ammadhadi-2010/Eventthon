import {
  FiAlertTriangle,
  FiBookOpen,
  FiDroplet,
  FiGift,
  FiHeart,
  FiShield,
  FiUsers,
  FiCoffee,
} from 'react-icons/fi';
import { FaHandHoldingHeart } from 'react-icons/fa6';

export const DONATION_CAUSES = [
  { id: 'all', label: 'All Causes', icon: FiHeart, color: '#8b5cf6' },
  { id: 'education', label: 'Education', icon: FiBookOpen, color: '#3b82f6' },
  { id: 'orphans', label: 'Orphans', icon: FiUsers, color: '#ec4899' },
  { id: 'water', label: 'Water', icon: FiDroplet, color: '#06b6d4' },
  { id: 'food', label: 'Food', icon: FiCoffee, color: '#f59e0b' },
  { id: 'healthcare', label: 'Healthcare', icon: FaHandHoldingHeart, color: '#ef4444' },
  { id: 'quran', label: 'Quran & Dawah', icon: FiBookOpen, color: '#10b981' },
  { id: 'emergency', label: 'Emergency', icon: FiAlertTriangle, color: '#f97316' },
];

export const DONATION_ORGANIZATIONS = [
  {
    id: 'alkhidmat',
    name: 'Alkhidmat Foundation Pakistan',
    description: 'Humanitarian services including health, education, disaster relief, and community welfare across Pakistan.',
    website: 'https://alkhidmat.org/',
    causes: ['education', 'healthcare', 'emergency', 'food', 'water'],
    color: '#059669',
    logo: 'AK',
  },
  {
    id: 'edhi',
    name: 'Edhi Foundation',
    description: 'Ambulance, orphanages, shelters, and emergency response — serving humanity without discrimination.',
    website: 'https://edhi.org/',
    causes: ['orphans', 'healthcare', 'emergency', 'food'],
    color: '#16a34a',
    logo: 'EF',
  },
  {
    id: 'skmt',
    name: 'Shaukat Khanum Memorial Trust',
    description: 'Cancer care, research, and treatment for patients who cannot afford life-saving medical support.',
    website: 'https://shaukatkhanum.org.pk/',
    causes: ['healthcare', 'emergency'],
    color: '#2563eb',
    logo: 'SK',
  },
  {
    id: 'akhuwat',
    name: 'Akhuwat Foundation',
    description: 'Interest-free microfinance, education, and health programs to uplift underserved communities.',
    website: 'https://akhuwat.org.pk/',
    causes: ['education', 'food', 'healthcare'],
    color: '#7c3aed',
    logo: 'AF',
  },
];

export const DONATION_HERO_FEATURES = [
  { icon: FiUsers, text: '100% Direct to organizations' },
  { icon: FiShield, text: 'Verified Organizations' },
  { icon: FiGift, text: 'Transparent & Secure' },
];

export const DONATION_STEPS = [
  { title: 'Choose a Cause', text: 'Pick what matters most to you — education, health, food, or emergency relief.' },
  { title: 'Donate Securely', text: 'Give through verified partners with full transparency on where your Thon goes.' },
  { title: 'Make an Impact', text: 'Track your contribution and earn platform rewards for spreading goodness.' },
];

export const DONATION_COMMITMENTS = [
  { icon: FiShield, title: 'Verified Partners Only', text: 'Every organization is reviewed before appearing on EventThon Donate.' },
  { icon: FiHeart, title: '12% Net Profits Pledge', text: 'EventThon commits 12% of net profits to verified charitable initiatives.' },
  { icon: FiGift, title: 'Full Transparency', text: 'Clear reporting on causes supported and community impact over time.' },
];

export const DONATION_PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export const DONATION_IMAGES = {
  hero: '/assets/donation/donation-hero.png',
  reward: '/assets/donation/donation-reward.png',
};
