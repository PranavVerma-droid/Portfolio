/*
  The `trips` collection, with each trip's photos and videos.

  Photos are resized by Astro's image endpoint (PocketBase thumbnails aren't enabled on
  this field): square WebP tiles for the strip, and a large WebP for the viewer.
  Videos are served as-is from PocketBase. location and coverImage are not used.
*/
import { getImage } from 'astro:assets';
import { list, fileUrl, type BaseRecord } from './pb';
import { richOrPlain } from './richtext';
import { isoDate, year } from './format';

interface TripRecord extends BaseRecord {
  name: string;
  country: string;
  startDate: string;
  endDate: string;
  description: string;
  photos: string[];
  photoAlbumLink: string;
  notionLink: string;
  isFeatured: boolean;
}

export type Media =
  | { kind: 'image'; full: string; tile: string; tile2x: string; tile3x: string; original: string }
  | { kind: 'video'; src: string; type: string };

export interface Trip {
  id: string;
  name: string;
  country: string;
  /** YYYY-MM-DD, or "". */
  start: string;
  end: string;
  year: string;
  /** Sanitized HTML, or "". */
  description: string;
  links: { href: string; label: string }[];
  featured: boolean;
  media: Media[];
}

const TILE = 96;       // CSS px; tiles are square (112px on touch screens)
const FULL = 1600;     // longest side in the viewer

/* Decide by extension: some files' extensions don't match their contents, but videos are always .mp4/.mov/.webm. */
const VIDEO = /\.(mp4|m4v|mov|webm)$/i;
const videoType = (name: string) =>
  /\.webm$/i.test(name) ? 'video/webm' : /\.mov$/i.test(name) ? 'video/quicktime' : 'video/mp4';

async function toMedia(r: TripRecord, name: string): Promise<Media> {
  const src = fileUrl(r, name);
  if (VIDEO.test(name)) return { kind: 'video', src, type: videoType(name) };
  const [tile, tile2x, tile3x, full] = await Promise.all([
    getImage({ src, width: TILE, height: TILE, fit: 'cover', format: 'webp' }),
    getImage({ src, width: TILE * 2, height: TILE * 2, fit: 'cover', format: 'webp' }),
    getImage({ src, width: 336, height: 336, fit: 'cover', format: 'webp' }), // 112px at 3x
    getImage({ src, width: FULL, height: FULL, fit: 'inside', format: 'webp' }),
  ]);
  return { kind: 'image', tile: tile.src, tile2x: tile2x.src, tile3x: tile3x.src, full: full.src, original: src };
}

export async function getTrips(): Promise<Trip[]> {
  const records = await list<TripRecord>('trips');
  const trips = await Promise.all(records.map(async (r): Promise<Trip> => {
    const start = r.startDate ? isoDate(r.startDate) : '';
    const end = r.endDate ? isoDate(r.endDate) : '';
    return {
      id: r.id,
      name: r.name,
      country: r.country ?? '',
      start,
      end,
      year: year(start || end),
      description: richOrPlain(r.description),
      links: [
        ...(r.photoAlbumLink ? [{ href: r.photoAlbumLink, label: 'album' }] : []),
        ...(r.notionLink ? [{ href: r.notionLink, label: 'notes' }] : []),
      ],
      featured: !!r.isFeatured,
      media: await Promise.all((r.photos ?? []).map((name) => toMedia(r, name))),
    };
  }));
  // Featured first, then newest.
  return trips.sort((a, b) => Number(b.featured) - Number(a.featured) || b.start.localeCompare(a.start));
}
