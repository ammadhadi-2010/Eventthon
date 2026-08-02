import {
  FiAlertTriangle,
  FiBookOpen,
  FiCoffee,
  FiDroplet,
  FiGift,
  FiHeart,
  FiShield,
  FiUsers,
} from 'react-icons/fi';
import { FaHandHoldingHeart } from 'react-icons/fa6';

export const DONATION_ICON_MAP = {
  heart: FiHeart,
  book: FiBookOpen,
  users: FiUsers,
  droplet: FiDroplet,
  coffee: FiCoffee,
  health: FaHandHoldingHeart,
  alert: FiAlertTriangle,
  gift: FiGift,
  shield: FiShield,
};

export function resolveDonationIcon(iconKey) {
  return DONATION_ICON_MAP[iconKey] || FiHeart;
}
