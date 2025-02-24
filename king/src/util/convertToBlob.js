//base64 > blob
export const convertToBlob = (baseImage) => {
  const byteCharacters = atob(baseImage);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  // Blob 객체 생성
  const blob = new Blob(byteArrays, { type: 'image/jpeg' });
  return blob;
};
