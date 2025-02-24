// 날짜 문자열에서 'YYYY-MM-DD' 형식으로 변환하는 함수
export const formatDate = (dateString) => {
  if (!dateString) return ''; // 값이 없을 경우 빈 문자열 반환
  return dateString.split('T')[0]; // "T" 기준으로 문자열을 나누고 첫 번째 부분(YYYY-MM-DD) 반환
};
