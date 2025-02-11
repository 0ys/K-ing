import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import KingLogo from '../../assets/icons/king_logo.png';
import { checkNickname } from '../../lib/auth';
import { getUserProfile, updateUserProfile } from '../../lib/user';
import { ProfileState } from '../../recoil/atom';
import { getLanguage, getTranslations, setLanguage } from '../../util/languageUtils';
import SettingHeader from './SettingHeader';

const SettingProfile = () => {
  const [profile, setProfile] = useRecoilState(ProfileState);
  const { imageUrl, nickname, description } = profile || {}; // Recoil 상태에서 가져오기 구조분해 할당

  const [selectedImage, setSelectedImage] = useState(imageUrl); // 미리보기용 이미지
  const [imageFile, setImageFile] = useState(null); // 업로드할 파일 저장
  const fileInputRef = useRef(null); // 파일 선택창 참조

  const [newNickname, setNewNickname] = useState(nickname || '');
  const [newDescription, setNewDescription] = useState(description || '');

  const [isValidName, setIsValidName] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [language, setLangState] = useState(getLanguage());
  const { common, profile: profileTranslations, signup: translations } = getTranslations(language);

  // 프로필 이미지 클릭 시 파일 선택창 열기
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // 선택한 이미지 미리보기 업데이트
  const handleImageChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      //5MB
      alert('업로드 가능한 최대 용량은 5MB입니다. ');
      setErrorMessage('이미지 파일 크기는 최대 5MB까지 업로드 가능합니다.');
      event.target.type = '';
      event.target.type = 'file';
      return;
    }

    if (file.name.endsWith('.heic') || file.name.endsWith('.heif')) {
      //heic 이미지 처리
      try {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
        });

        console.log(convertedBlob);

        const newFilename = file.name.replace(/\.(heic|heif)$/i, '.jpg'); // Regex to replace both .heic and .heif
        const newFile = new File([convertedBlob], newFilename, {
          type: 'image/jpeg',
          lastModified: new Date().getTime(),
        });

        console.log(newFile);

        setImageFile(newFile);
        setImage(URL.createObjectURL(newFile));
      } catch (error) {
        console.error(error);
        alert('HEIC 파일 변환에 실패했습니다.');
      }
    }
    // 정상적인 경우에만 이미지 설정
    else {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  // 새로고침 시 Recoil 상태가 초기화되므로 서버에서 데이터 다시 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!profile || !profile.nickname) {
          // Recoil 상태가 비어있을 때만 요청
          const data = await getUserProfile(jwtDecode(accessToken).userId);
          setProfile(data.data); // Recoil 상태 업데이트
        }
      } catch (error) {
        console.error('❌ 프로필 데이터를 불러오는 중 오류 발생:', error);
      }
    };

    fetchProfile();
  }, [setProfile]);

  // 닉네임 유효성 검사
  useEffect(() => {
    const trimmedName = newNickname.trim();

    if (nickname.length === 0) {
      setIsValidName(false);
      setErrorMessage(translations.nicknameErrorLength);
    } else if (trimmedName.length === 0) {
      setIsValidName(false);
      setErrorMessage(translations.nicknameErrorWhitespace);
    } else if (trimmedName.length > 50) {
      setIsValidName(false);
      setErrorMessage(translations.nicknameErrorLength);
    } else {
      setIsValidName(true);
      setErrorMessage('');
    }
  }, [newNickname, translations]);

  // 닉네임 중복 검사 (기존 닉네임이면 검사 생략)
  useEffect(() => {
    if (!isValidName) return;

    if (newNickname === nickname) {
      setIsNameAvailable(true);
      setErrorMessage('');
      return;
    }

    setCheckingName(true);
    const timer = setTimeout(async () => {
      const { success, message } = await checkNickname(newNickname, language);
      setIsNameAvailable(success);

      if (!success) {
        setErrorMessage(message);
      }

      setCheckingName(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [newNickname, isValidName]);

  // description 글자수 제한 (150자)
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 150) {
      setNewDescription(value);
    }
  };

  // 토큰에서 언어 설정 가져오기
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const decoded = jwtDecode(accessToken);
      if (decoded.language && decoded.language !== language) {
        setLanguage(decoded.language);
        setLangState(decoded.language);
      }
    }
  }, []);

  // 전역 언어 변경 감지하여 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLangState(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  // 변경 사항 저장
  const handleSave = async () => {
    if (!isValidName || !isNameAvailable) {
      alert(translations.nicknameErrorDuplicate);
      return;
    }
    const updatedProfile = {};

    // 변경된 값만 저장
    if (newNickname !== nickname) updatedProfile.nickname = newNickname;
    if (newDescription !== description) updatedProfile.description = newDescription;

    if (Object.keys(updatedProfile).length === 0 && !imageFile) {
      return;
    }

    // API 호출
    const response = await updateUserProfile(updatedProfile, imageFile);

    // Recoil 상태 업데이트
    setProfile((prev) => ({
      ...prev,
      ...updatedProfile, // 변경된 값만 반영
      imageUrl: response.data.imageUrl || prev.imageUrl, // 이미지가 변경되지 않았다면 기존 이미지 유지
    }));

    alert('프로필이 저장되었습니다!');
  };

  return (
    <StSettingProfileWrapper>
      <SettingHeader />

      <St.ContentWrapper>
        {/* 프로필 사진 */}
        <St.ProfileImageWrapper onClick={handleImageClick}>
          <St.ProfileImage src={selectedImage} alt="프로필 이미지" />
          <input
            type="file"
            accept="image/png, image/jpeg, image/heic"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </St.ProfileImageWrapper>

        {/* 닉네임 수정 */}
        <St.Section>
          <St.Label>{profileTranslations.nickname}</St.Label>
          <St.Input
            type="text"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
          />
          <St.StatusMessageWrapper>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            {isValidName && isNameAvailable && (
              <SuccessMessage>{translations.nicknameAvailable}</SuccessMessage>
            )}
          </St.StatusMessageWrapper>
        </St.Section>

        {/* 소개 수정 */}
        <St.Section>
          <St.Label>{profileTranslations.description}</St.Label>
          <St.TextArea value={newDescription} onChange={handleDescriptionChange} maxLength={150} />
          <St.Counter>{newDescription.length} / 150</St.Counter>
        </St.Section>
      </St.ContentWrapper>

      {/* 저장 버튼 */}
      <St.ButtonWrapper>
        <St.SaveButton disabled={!isValidName || !isNameAvailable} onClick={handleSave}>
          {common.save}
        </St.SaveButton>
      </St.ButtonWrapper>
    </StSettingProfileWrapper>
  );
};

export default SettingProfile;

const StSettingProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const St = {
  ContentWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
  `,
  ProfileImageWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
  `,
  ProfileImage: styled.img`
    width: 10rem;
    height: 10rem;
    border-radius: 50%;
    object-fit: cover;
    border: 0.1rem solid ${({ theme }) => theme.colors.Gray3};
  `,

  Section: styled.div`
    width: 100%;
    margin-bottom: 2rem;
  `,
  Label: styled.label`
    ${({ theme }) => theme.fonts.Body3}
    font-weight: bold;
    display: block;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
  `,
  Input: styled.input`
    width: 100%;
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.colors.Gray2};
    border-radius: 5px;
    box-sizing: border-box;
    ${({ theme }) => theme.fonts.Body3};
  `,
  TextArea: styled.textarea`
    width: 100%;
    height: 13rem;
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.colors.Gray2};
    border-radius: 5px;
    resize: none;
    box-sizing: border-box;
    ${({ theme }) => theme.fonts.Body3};
  `,
  Counter: styled.div`
    text-align: right;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.Gray2};
    margin-top: 0.5rem;
  `,
  StatusMessageWrapper: styled.div`
    height: 1.6rem;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding-top: 0.5rem;
  `,
  ButtonWrapper: styled.div`
    display: flex;
    justify-content: center;
    margin-top: auto;
    padding-bottom: 2rem;
  `,
  SaveButton: styled.button`
    width: 90%;
    padding: 1rem;
    background-color: ${({ theme }) => theme.colors.Gray1};
    color: white;
    ${({ theme }) => theme.fonts.Title6};
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
    &:disabled {
      background-color: ${({ theme }) => theme.colors.Gray3};
      cursor: not-allowed;
    }
  `,
};

const ErrorMessage = styled.p`
  color: red;
  margin-top: 0.5rem;
  ${({ theme }) => theme.fonts.Body4};
`;

const SuccessMessage = styled.p`
  color: green;
  ${({ theme }) => theme.fonts.Body4};
  margin-top: 0.5rem;
`;
