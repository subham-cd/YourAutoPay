import type { ImageSourcePropType } from 'react-native';
import { icons } from '@/constants/icons';

const ICON_KEYWORDS: Array<{ keywords: string[]; icon: ImageSourcePropType; color: string }> = [
  { keywords: ['spotify'], icon: icons.spotify, color: '#1DB954' },
  { keywords: ['netflix'], icon: icons.netflix, color: '#E50914' },
  { keywords: ['notion'], icon: icons.notion, color: '#000000' },
  { keywords: ['figma'], icon: icons.figma, color: '#F24E1E' },
  { keywords: ['github', 'git hub'], icon: icons.github, color: '#181717' },
  { keywords: ['claude'], icon: icons.claude, color: '#D97757' },
  { keywords: ['canva'], icon: icons.canva, color: '#00C4CC' },
  { keywords: ['adobe'], icon: icons.adobe, color: '#FF0000' },
  { keywords: ['dropbox'], icon: icons.dropbox, color: '#0061FF' },
  { keywords: ['medium'], icon: icons.medium, color: '#000000' },
  { keywords: ['openai', 'chatgpt', 'gpt'], icon: icons.openai, color: '#412991' },
];

const PASTEL_COLORS = [
  '#f5c542', // Yellow
  '#b8d4e3', // Blue
  '#e8def8', // Purple
  '#95e1d3', // Teal
  '#ff6b6b', // Red
  '#f8b1d4', // Pink
  '#d4e157', // Lime
  '#ffcc80', // Orange
];

const normalizeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s+]/g, ' ')
    .replace(/\s+/g, ' ');

export function resolveSubscriptionIcon(name: string): ImageSourcePropType {
  const normalizedName = normalizeName(name);

  const matched = ICON_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(keyword))
  );

  return matched?.icon ?? icons.plus;
}

export function resolveSubscriptionColor(name: string, category?: string): string {
  const normalizedName = normalizeName(name);

  const matched = ICON_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(keyword))
  );

  if (matched?.color) {
    return matched.color;
  }

  // Use a hash of the name to pick a consistent pastel color if no brand match
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
}
