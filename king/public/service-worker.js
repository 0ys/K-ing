// const addResourcesToCache = async (resources) => {
//   // 오프라인 데이터 저장을 위해 Cache Storage 활용
//   const cache = await caches.open('my-cache');
//   await cache.addAll(resources);
// };

//install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] installed');
  //   event.waitUntil(
  //     addResourcesToCache([
  //       // 캐시하려는 모든 리소스를 나열..
  //       '/index.html',
  //       '/assets/index.css',
  //       '/static/bear.png',
  //       '/static/chicken.png',
  //       '/static/dog.png',
  //       '/static/giraffe.png',
  //       '/static/meerkat.png',
  //       '/static/panda.png',
  //     ]),
  //   );
});

// activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] actived', event);
});

// fetch event
self.addEventListener('fetch', (event) => {
  //   console.log('[Service Worker] fetched resource ' + event.request.url);
});
