/*
  Last listened song, from ListenBrainz. Fetched on the server when the page renders.
  Cached for a minute; if ListenBrainz is slow or down the section is simply left out.
*/

const USER = 'PranavVerma-droid';
const API = `https://api.listenbrainz.org/1/user/${USER}/listens?count=1`;
const TTL_MS = 60_000;

interface Listen {
  listened_at: number;
  track_metadata: {
    track_name: string;
    artist_name: string;
    release_name?: string;
    mbid_mapping?: { release_mbid?: string; recording_mbid?: string; caa_release_mbid?: string; caa_id?: number };
  };
}

export interface Song {
  track: string;
  artist: string;
  album: string;
  /** Unix seconds. */
  listenedAt: number;
  /** Cover Art Archive thumbnail, or "". */
  cover: string;
  /** MusicBrainz recording page, or "". */
  href: string;
}

let cached: { at: number; song: Song | undefined } | undefined;

function coverUrl(m: NonNullable<Listen['track_metadata']['mbid_mapping']>): string {
  if (m.caa_release_mbid && m.caa_id) return `https://coverartarchive.org/release/${m.caa_release_mbid}/${m.caa_id}-250.jpg`;
  if (m.release_mbid) return `https://coverartarchive.org/release/${m.release_mbid}/front-250`;
  return '';
}

export async function getLastSong(): Promise<Song | undefined> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.song;
  let song: Song | undefined;
  try {
    const res = await fetch(API, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`ListenBrainz ${res.status}`);
    const listen: Listen | undefined = (await res.json())?.payload?.listens?.[0];
    if (listen) {
      const m = listen.track_metadata.mbid_mapping ?? {};
      song = {
        track: listen.track_metadata.track_name,
        artist: listen.track_metadata.artist_name,
        album: listen.track_metadata.release_name ?? '',
        listenedAt: listen.listened_at,
        cover: coverUrl(m),
        href: m.recording_mbid ? `https://musicbrainz.org/recording/${m.recording_mbid}` : '',
      };
    }
  } catch (err) {
    console.error(`[listening] ${(err as Error).message}`);
    if (cached) return cached.song; // keep showing the last good one
  }
  cached = { at: Date.now(), song };
  return song;
}

/** "just now", "12 min ago", "3 hours ago", "2 days ago", else the date. */
export function timeAgo(unix: number, now = Date.now() / 1000): string {
  const s = Math.max(0, Math.floor(now - unix));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) { const h = Math.floor(s / 3600); return `${h} hour${h === 1 ? '' : 's'} ago`; }
  if (s < 604800) { const d = Math.floor(s / 86400); return `${d} day${d === 1 ? '' : 's'} ago`; }
  return new Date(unix * 1000).toISOString().slice(0, 10);
}
