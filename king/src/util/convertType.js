// FE - BE 타입 매칭 시키는 함수

export const convertType = (frontendType) => {
  const typeMap = {
    drama: 'content',
    movie: 'content',
    show: 'content',
    cast: 'cast',
    works: 'content',
    people: 'cast',
  };
  return typeMap[frontendType] || frontendType; // 변환이 없으면 원래 값 그대로 반환
};
