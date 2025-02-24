let socketRef = null;

export function connectWebSocket(url, updateMessages) {
  if (socketRef && socketRef.readyState !== WebSocket.CLOSED) {
    console.log('🚀 기존 WebSocket 연결 존재 -> 새로운 연결 생성 방지');
    return;
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error('❌ WebSocket 연결 실패: 토큰 없음');
    return;
  }

  socketRef = new WebSocket(`${url}?token=${token}`);

  socketRef.onopen = () => {
    console.log('✅ WebSocket 연결됨');
  };

  socketRef.onmessage = (event) => {
    updateMessages(event.data);
  };

  socketRef.onclose = () => {
    console.log('❌ WebSocket 연결 종료됨');
  };

  socketRef.onerror = (error) => {
    console.error('⚠️ WebSocket 오류 발생:', error);
  };
}

export function sendMessageViaWebSocket(message) {
  if (socketRef && socketRef.readyState === WebSocket.OPEN) {
    socketRef.send(message);
  } else {
    console.error('⚠️ WebSocket이 닫혀 있음 또는 메시지가 비어 있음.');
  }
}

export function closeWebSocket() {
  if (socketRef) {
    socketRef.close();
    socketRef = null;
  }
}

export function isWebSocketConnected() {
  return socketRef && socketRef.readyState === WebSocket.OPEN;
}
