const APP_VERSION = '1.0.0';

function updateCacheVersion() {
    // Force reload if version changed
    const currentVersion = localStorage.getItem('app_version');
    if (currentVersion !== APP_VERSION) {
        localStorage.setItem('app_version', APP_VERSION);
        window.location.reload(true);
    }
}

// Add this to clear cache on load
window.addEventListener('load', function() {
    updateCacheVersion();
});
