/* The `socials` collection: name, icon and profile link. socialImg is not used. */
import { list, type BaseRecord } from './pb';

interface SocialRecord extends BaseRecord {
  socialName: string;
  socialSource: string;
  socialIcon: string;
  socialImg: string;
}

export interface Social {
  name: string;
  href: string;
  /** A data:image/svg+xml URL, safe to put inside CSS url("…"), or "" if the icon is missing or unusable. */
  icon: string;
}

/* The icon is drawn as a CSS mask, so it must be an SVG data URL with nothing that could break out of url("…"). */
const safeIcon = (icon: string) =>
  /^data:image\/svg\+xml[;,]/.test(icon) && !/["\\\n\r<>]/.test(icon) ? icon.trim() : '';

export async function getSocials(): Promise<Social[]> {
  const records = await list<SocialRecord>('socials');
  return records
    .filter((r) => r.socialName && /^https?:\/\//.test(r.socialSource ?? ''))
    .map((r) => ({ name: r.socialName, href: r.socialSource, icon: safeIcon(r.socialIcon ?? '') }));
}

export const EMAILS = ['hi@pranavv.co.in', 'pranavverma@connect.hku.hk'];
