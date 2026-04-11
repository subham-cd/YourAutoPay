import type { ImageSourcePropType } from 'react-native';
import { icons } from '@/constants/icons';

const ICON_KEYWORDS: Array<{ keywords: string[]; icon: ImageSourcePropType }> = [
  { keywords: ['spotify'], icon: icons.spotify },
  { keywords: ['netflix'], icon: icons.netflix },
  { keywords: ['notion'], icon: icons.notion },
  { keywords: ['figma'], icon: icons.figma },
  { keywords: ['github', 'git hub'], icon: icons.github },
  { keywords: ['claude'], icon: icons.claude },
  { keywords: ['canva'], icon: icons.canva },
  { keywords: ['adobe'], icon: icons.adobe },
  { keywords: ['dropbox'], icon: icons.dropbox },
  { keywords: ['medium'], icon: icons.medium },
  { keywords: ['openai', 'chatgpt', 'gpt'], icon: icons.openai },
];

const normalizeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s+]/g, ' ')
    .replace(/\s+/g, ' ');

export function resolveSubscriptionIcon(name: string): ImageSourcePropType {
  const normalizedName = normalizeName(name);

  const matchedIcon = ICON_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(keyword))
  );

  return matchedIcon?.icon ?? icons.plus;
}
