"use strict";

console.log("Hello from your friendly neighborhood service worker!");

const FILES_TO_CACHE= [
    '/',
  '/index.html',
  '/js/index.js',
  '/js/idb.js',
  '/manifest.json',
  '/css/styles.css',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
  //   "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
  ]

const CACHE_NAME = `static-cache-v1`;
const DATA_CACHE_NAME = `data-cache-v1`;

// Install
self.addEventListener(`install`, (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`Your files were pre-cached successfully!`);
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Activate
self.addEventListener(`activate`, (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log(`Removing old cache data`, key);
            return caches.delete(key);
          }
          return undefined;
        })
      )
    )
  );

  self.clients.claim();
});

// Fetch event
self.addEventListener(`fetch`, (evt) => {
  if (evt.request.url.includes(`/api/`)) {
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) =>
          fetch(evt.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }

              return response;
            })
            // Network request failed, try to get it from the cache.
            .catch(() => cache.match(evt.request))
        )
        .catch((err) => console.log(err))
    );
  } else {
    evt.respondWith(
      caches
        .match(evt.request)
        .then((response) => response || fetch(evt.request))
    );
  }
});
