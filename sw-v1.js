var cacheName = "myfirstPWA-v5";
var dataCacheName = "myfirstPWA-v5";
var urlToCache = [
  "/",
  "/index.html",
  "/styles/ud811.css",
  "/scripts/app.js",
  "/images/clear.png"
];
var weatherAPIUrlBase = "https://publicdata-weather.firebaseio.com/";

self.addEventListener("install", e => {
  //Perform install steps
  console.log("installing");
  e.waitUntil(
    caches
      .open(cacheName)
      .then(cache => {
        cache.addAll(urlToCache);
        console.log("Opened Cache");
      })
      .catch(err => console.log(err))
  );
});

self.addEventListener("activate", e => {
  console.log("[Service Worker] activate event");
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== cacheName && key !== dataCacheName) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", e => {
  console.log("[Service Worker] fetch event");
  if (e.request.url.startsWith(weatherAPIUrlBase)) {
    e.respondWith(
      fetch(e.request).then(response => {
        return caches.open(dataCacheName).then(cache => {
          cache.put(e.request.url, response.clone());
          console.log("[Service Worker] Fetched and Cached");
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(response => {
        {
          console.log("[Service Worker] Fetch Only");
          return response || fetch(e.request);
        }
      })
    );
  }
});
