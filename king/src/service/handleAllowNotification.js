import { getToken, onMessage } from 'firebase/messaging';

import { postFcmToken } from '../lib/fcm';
import { initFirebase } from './initFirebase';

export const handleAllowNotification = async () => {
  const messaging = initFirebase();

  try {
    console.log('권한 요청중...');
    const permission = await Notification.requestPermission();
    if (permission === 'denied') {
      console.log('알림 설정 거부');
      return;
    }

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        console.log('FCM Token:', token);
        localStorage.setItem('fcmToken', token);
        postFcmToken(token);
      } else {
        alert('Failed to register FCM token');
      }
    }
  } catch (error) {
    console.error('Error in notification permission:', error);
  }

  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);

    const notificationTitle = payload.data?.title || '알림';
    const notificationOptions = {
      body: payload.data?.body,
      icon: '/logo.png',
      data: payload.data?.link,
    };

    if (!isMobile()) {
      const notif = new Notification(notificationTitle, notificationOptions);
      notif.onclick = (event) => {
        event.preventDefault();
        const link = payload.data?.link || 'https://i12a507.p.ssafy.io/';
        window.location.href = link;
        notif.close();
      };
    } else if (!isIOSAPP()) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(notificationTitle, notificationOptions);
      });
    }

    // if (Notification.permission === 'granted') {
    //   try {
    //     if (Notification.permission === 'granted' && document.visibilityState === 'visible') {
    //       new Notification(notificationTitle, notificationOptions);

    //       // notification.onclick = function (event) {
    //       //   event.preventDefault();
    //       //   window.open(notificationOptions.fcmOptions.link, '/');
    //       // };
    //     }
    //   } catch (error) {
    //     console.error('알림 생성 중 오류 발생:', error);
    //   }
    // } else {
    //   console.warn('알림 권한이 허용되지 않았습니다.');
    // }
  });
};

function isMobile() {
  return /Mobi/i.test(navigator.userAgent);
}

function isIOSAPP() {
  // iOS 디바이스인지 확인
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return isIOS;
}
