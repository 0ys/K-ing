import heic2any from 'heic2any';

export const convertHeicToJpeg = async (file) => {
  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
    });

    const newFilename = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    const newFile = new File([convertedBlob], newFilename, {
      type: 'image/jpeg',
      lastModified: new Date().getTime(),
    });

    return newFile;
  } catch (error) {
    console.error(error);
    alert('HEIC 파일 변환에 실패했습니다.');
  }
};
