// 
// Copyright (C) 2024  Pranav Verma
// Licensed under GNU AGPL v3
//

const LISTENBRAINZ_USER = 'PranavVerma-droid';
const LISTENBRAINZ_API = `https://api.listenbrainz.org/1/user/${LISTENBRAINZ_USER}/listens?count=1`;

// Fetch last listened song from ListenBrainz
async function fetchLastListenedSong() {
    try {
        const response = await fetch(LISTENBRAINZ_API);
        const data = await response.json();
        
        if (data.payload && data.payload.listens && data.payload.listens.length > 0) {
            const listen = data.payload.listens[0];
            const trackMetadata = listen.track_metadata;
            
            // Extract song information
            const songData = {
                trackName: trackMetadata.track_name,
                artistName: trackMetadata.artist_name,
                releaseName: trackMetadata.release_name || 'Unknown Album',
                listenedAt: listen.listened_at,
                releaseMbid: trackMetadata.mbid_mapping?.release_mbid || null,
                recordingMbid: trackMetadata.mbid_mapping?.recording_mbid || null
            };
            
            displayMusicPlayer(songData);
        } else {
            displayMusicPlayerError('No recent listens found');
        }
    } catch (error) {
        console.error('Error fetching ListenBrainz data:', error);
        displayMusicPlayerError('Unable to load music data');
    }
}

// Display the music player with song data
function displayMusicPlayer(songData) {
    const container = document.getElementById('lastListenedSong');
    
    // Get album art URL
    const albumArtUrl = songData.releaseMbid 
        ? `https://coverartarchive.org/release/${songData.releaseMbid}/front-250`
        : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="250" height="250" viewBox="0 0 250 250"%3E%3Crect width="250" height="250" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23999"%3ENo Cover%3C/text%3E%3C/svg%3E';
    
    // Get MusicBrainz link
    const musicBrainzLink = songData.recordingMbid 
        ? `https://musicbrainz.org/recording/${songData.recordingMbid}`
        : null;
    
    // Format the "listened at" time
    const timeAgo = formatTimeAgo(songData.listenedAt);
    
    const linkStart = musicBrainzLink ? `<a href="${musicBrainzLink}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: flex; gap: 1rem; align-items: center;">` : '<div style="display: flex; gap: 1rem; align-items: center;">';
    const linkEnd = musicBrainzLink ? '</a>' : '</div>';
    
    container.innerHTML = `
        <div class="music-mini-header">🎵 Last Listened</div>
        <div class="music-player-content">
            ${linkStart}
                <div class="album-art">
                    <img src="${albumArtUrl}" alt="${songData.releaseName}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22250%22 height=%22250%22 viewBox=%220 0 250 250%22%3E%3Crect width=%22250%22 height=%22250%22 fill=%22%23333%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%23999%22%3ENo Cover%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="song-info">
                    <div class="song-title">${escapeHtml(songData.trackName)}</div>
                    <div class="song-artist">${escapeHtml(songData.artistName)}</div>
                    <div class="song-album">${escapeHtml(songData.releaseName)}</div>
                    <div class="song-timestamp">${timeAgo}</div>
                </div>
            ${linkEnd}
        </div>
    `;
}

// Display error message
function displayMusicPlayerError(message) {
    const container = document.getElementById('lastListenedSong');
    container.innerHTML = `
        <div class="music-player-error">
            <p>${message}</p>
        </div>
    `;
}

// Format timestamp to "X hours/minutes/days ago"
function formatTimeAgo(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    
    // If more than a week, show the actual date
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchLastListenedSong);
} else {
    fetchLastListenedSong();
}

// Refresh every 5 minutes
setInterval(fetchLastListenedSong, 5 * 60 * 1000);
