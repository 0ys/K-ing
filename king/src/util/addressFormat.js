// 주소를 "서울시 마포구"까지만 추출하는 함수
export const getShortAddress = (fullAddress) => {
  if (!fullAddress) return ''; // 값이 없을 경우 빈 문자열 반환
  const parts = fullAddress.split(' '); // 공백을 기준으로 나누기
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`; // 첫 번째와 두 번째 부분만 반환
  }
  return fullAddress; // 주소가 짧거나 비정상적인 경우 원본 반환
};
