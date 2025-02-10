export const splitIntoSentences = (message, sender) => {
  const emojiRegex = /[\p{Emoji_Presentation}\u200D\u2600-\u2B55]/gu; // 이모티콘 감지 정규식
  const isEmojiOnly = (text) => emojiRegex.test(text) && text.replace(emojiRegex, '').trim() === '';

  // 숫자 뒤에 오는 온점을 문장 구분자로 인식하지 않음 + 줄바꿈(\n)도 문장 구분자로 사용
  const sentenceRegex = /(?<!\d)([.!?])\s+|\n+/g;

  return message
    .split(sentenceRegex) // 문장 구분 (온점, 느낌표, 물음표 기준)
    .filter(Boolean) // 빈 값 제거
    .reduce((result, sentence, index, arr) => {
      // 다음 문장이 구두점이라면 현재 문장과 합침
      if (arr[index + 1] && /^[.!?]$/.test(arr[index + 1])) {
        sentence += arr[index + 1]; // 구두점 추가
        arr.splice(index + 1, 1); // 추가된 구두점 제거
      }

      // 이모티콘만으로 이루어진 경우 처리
      if (isEmojiOnly(sentence)) {
        if (index === 0 || result.length === 0) {
          result.push({
            text: sentence,
            sender,
            type: 'message',
          });
        } else {
          // **이전 문장의 뒤에** 이모티콘을 추가하도록 변경
          result[result.length - 1].text += sentence;
        }
      } else {
        // 일반 문장인 경우 새 메시지로 추가
        result.push({
          text: sentence.trim(),
          sender,
          type: 'message',
        });
      }

      return result;
    }, []);
};
