export const splitIntoMessages = (message, sender, selectedBot) => {
  const emojiRegex = /[\p{Emoji_Presentation}\u200D\u2600-\u2B55]/gu;
  const isEmojiOnly = (text) => emojiRegex.test(text) && text.replace(emojiRegex, '').trim() === '';

  // ✅ `[]` 안의 내용 삭제
  //message = message.replace(/\[.*?\]/g, '').trim();

  // ✅ 눈에 보이지 않는 문자 및 공백 문자 제거 (제어 문자, BOM 등)
  message = message.replace(/[\p{C}\uFEFF]/gu, '').trim();

  const messages = [];
  const maxLength = selectedBot?.includes('T') ? 50 : 100; // ✅ 너무 짧거나 길지 않도록 적절한 기준

  let currentMessage = '';

  message.split(/(?<=[.!?])\s+|\n+/g).forEach((sentence) => {
    sentence = sentence.trim(); // ✅ 공백 제거
    if (!sentence) return; // ✅ 빈 문자열은 무시

    if (currentMessage.length + sentence.length > maxLength) {
      messages.push({ text: currentMessage.trim(), sender, type: 'message' });
      currentMessage = sentence;
    } else {
      currentMessage += (currentMessage ? ' ' : '') + sentence;
    }
  });

  if (currentMessage.trim()) {
    messages.push({ text: currentMessage.trim(), sender, type: 'message' });
  }

  return messages;
};
