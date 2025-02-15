self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    return caches.delete(cache);
                })
            );
        })
    );
});

navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
        registration.unregister();
    }
});
