const CONTENT_TYPE_KOR = [
  { setting_id: 0, name: 'drama', kor: '드라마' },
  { setting_id: 1, name: 'movie', kor: '영화' },
  { setting_id: 2, name: 'show', kor: '예능' },
  { setting_id: 3, name: 'cast', kor: '인물' },
  { setting_id: 4, name: 'place', kor: '장소' },
];

export const getContentTypeKor = (type) => {
  const krName = CONTENT_TYPE_KOR.find((item) => item.name === type);
  return krName ? krName.kor : '컨텐츠';
};
