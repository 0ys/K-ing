// Service Worker에서 웹소켓 요청 무시
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return; // 웹소켓 요청을 가로채지 않음
  }

  event.respondWith(fetch(event.request));
});
