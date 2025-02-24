importScripts('https://www.gstatic.com/firebasejs/11.3.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.3.1/firebase-messaging-compat.js');

self.addEventListener('install', function (e) {
  console.log('fcm sw install..');
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  console.log('fcm sw activate..');
});

const firebaseConfig = {
  apiKey: 'AIzaSyB8p08G09nNNBhhkfMSq7N13w2_m-DDqs4',
  authDomain: 'k-ing-963ce.firebaseapp.com',
  projectId: 'k-ing-963ce',
  storageBucket: 'k-ing-963ce.firebasestorage.app',
  messagingSenderId: '15736758900',
  appId: '1:15736758900:web:3de7509a7a6343c81de721',
  measurementId: 'G-8R193WXWGM',
};

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/logo.png',
    data: payload.data.link,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

//웹 푸시 알림 노출
// self.addEventListener('push', function (e) {
//   let payload = e.data.json();
//   console.log(payload);
//   // data를 통해 title과 body, link를 추출
//   let title = payload.data.title;
//   let body = payload.data.body;
//   let link = payload.webpush?.fcmOptions?.link || '/';
//   let options = {
//     body,
//     icon: 'https://king-s3-bucket.s3.us-east-1.amazonaws.com/uploads/default.jpg',
//     data: { link },
//   };
//   e.waitUntil(self.registration.showNotification(title, options));
// });
// self.addEventListener('push', function (e) {
//   console.log('웹푸시', e.data.json());
//   if (!e.data.json()) return;

//   const resultData = e.data.json().notification;
//   const fcmOptions = e.data.json().webpush;
//   const notificationTitle = resultData.title;
//   const notificationOptions = {
//     body: resultData.body,
//     icon: '/logo.png',
//     data: {
//       link: fcmOptions.link,
//     },
//   };

//   e.waitUntil(
//     self.registration
//       .showNotification(notificationTitle, notificationOptions)
//       .then(() => {
//         console.log('알림 성공');
//       })
//       .catch((error) => {
//         console.error('알림 실패:', error);
//       }),
//   );
// });

self.addEventListener('notificationclick', function (event) {
  console.log('[firebase-messaging-sw.js] 알림이 클릭되었습니다.', event);

  // event.preventDefault();

  // 아래의 event.notification.data는 위의 푸시 이벤트를 한 번 거쳐서 전달 받은 options.data에 해당한다.
  const link = event.notification.data || `https://i12a507.p.ssafy.io/`;
  event.notification.close();

  // 클라이언트에 해당 사이트가 열려있는지 체크
  if (link) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // 이미 열린 창이 있는지 확인
        let foundWindowClient = null;
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (link.includes('ssafy') && 'focus' in client) {
            foundWindowClient = client;
            break;
            // return client.focus();
          }
        }
        if (foundWindowClient) {
          return foundWindowClient.focus().then((focusedClient) => {
            if ('navigate' in focusedClient) {
              focusedClient.postMessage(link);
            }
          });
        }
        // 새 창을 열거나 이미 있는 창으로 이동
        else if (clients.openWindow) {
          return clients.openWindow(link);
        }
      }),
    );
  }
});
