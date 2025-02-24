import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcKing } from '../../assets/icons';
import { checkNickname, postSignup } from '../../lib/auth';
import commonLocales from '../../locales/common.json';
import signupLocales from '../../locales/signup.json';

const Signup = () => {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('ko');
  const [translations, setTranslations] = useState(signupLocales[language]);
  const [commonTranslations, setCommonTranslations] = useState(commonLocales[language]); // 공통 텍스트
  const [isValidName, setIsValidName] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState(false);
  const [checkingName, setCheckingName] = useState(false); // 중복 검사 진행 중 여부
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState(null); // 에러 유형 저장

  const navigate = useNavigate();

  // 로그인 및 ROLE_PENDING 확인
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) throw new Error('No access token found');

        const decoded = jwtDecode(accessToken);
        if (decoded.role !== 'ROLE_PENDING') {
          navigate('/'); // ROLE_PENDING이 아니면 홈으로 리디렉트
        }
      } catch (error) {
        console.error('유저 정보 확인 중 오류 발생:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  // 번역 데이터 설정
  useEffect(() => {
    if (!loading) {
      setTranslations(signupLocales[language]);
      setCommonTranslations(commonLocales[language]);

      if (errorType === 'DUPLICATE_NICKNAME') {
        checkNicknameAPI();
      }
    }
  }, [language, loading]);

  // 닉네임 유효성 검사
  useEffect(() => {
    if (!translations) return;
    const trimmedName = name.trim();

    if (name.length === 0) {
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
  }, [name, translations]);

  // 닉네임 중복 검사 API 호출 (언어 변경 시도 포함)
  const checkNicknameAPI = async () => {
    if (!isValidName) return;

    setCheckingName(true);
    const { success, message } = await checkNickname(name, language);

    setIsNameAvailable(success);

    if (!success) {
      setErrorType('DUPLICATE_NICKNAME');
      setErrorMessage(message);
    } else {
      setErrorType(null);
    }

    setCheckingName(false);
  };

  // 닉네임 입력 변경 시 자동 중복 검사 실행
  useEffect(() => {
    if (!isValidName) return;

    const timer = setTimeout(() => {
      checkNicknameAPI();
    }, 500); // 500ms 디바운싱 적용

    return () => clearTimeout(timer);
  }, [name, isValidName]);

  // 회원가입 API 호출
  const handleSignup = async () => {
    setErrorMessage('');

    const { success, message } = await postSignup(name, language);
    if (success) {
      navigate('/signup/complete');
    } else {
      console.error('회원가입 실패:', message);
      setErrorMessage(message);
    }
  };

  // 돌아가기
  const handleBack = async () => {
    navigate('/');
  };

  return (
    <StSignupWrapper>
      <St.ContentWrapper>
        <Title>{translations.title}</Title>
        <Title2>User Info</Title2>
        <St.IconWrapper>
          <IcKing />
        </St.IconWrapper>
        <St.LabelWrapper>
          <Label>{translations.nickname}</Label>
          <Label2>Nickname</Label2>
        </St.LabelWrapper>
        <Input
          type="text"
          placeholder={translations.nicknamePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <St.StatusMessageWrapper>
          {/* 닉네임 유효성 및 중복 검사 메시지 */}
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          {checkingName && <InfoMessage></InfoMessage>}
          {isValidName && isNameAvailable && (
            <SuccessMessage>{translations.nicknameAvailable}</SuccessMessage>
          )}
        </St.StatusMessageWrapper>
        <St.LabelWrapper>
          <Label>{commonTranslations.language}</Label>
          <Label2>Language</Label2>
        </St.LabelWrapper>
        <St.SelectWrapper>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="zh">中文(繁體)</option>
          </Select>
        </St.SelectWrapper>
      </St.ContentWrapper>
      <St.ButtonWrapper>
        <ButtonContainer>
          <Button onClick={handleBack}>{commonTranslations.back}</Button>
          <Button $primary disabled={!isValidName || !isNameAvailable} onClick={handleSignup}>
            {commonTranslations.signup}
          </Button>
        </ButtonContainer>
      </St.ButtonWrapper>
    </StSignupWrapper>
  );
};

export default Signup;

const StSignupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 5rem;
  position: relative;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.White};
`;

const St = {
  ContentWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 30rem;
    padding: 0 2rem;
    gap: 1.8rem;
  `,
  IconWrapper: styled.div`
    ${({ theme }) => theme.fonts.Title2}
  `,
  ButtonWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 30rem;
  `,
  SelectWrapper: styled.div`
    width: 100%;
    position: relative;
  `,
  StatusMessageWrapper: styled.div`
    height: 1.6rem;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding-bottom: 1.8rem;
  `,
  LabelWrapper: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
  `,
};

const Title = styled.h1`
  ${({ theme }) => theme.fonts.Title1}
`;
const Title2 = styled.h3`
  ${({ theme }) => theme.fonts.Title3}
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.Gray2};
`;

const Label = styled.label`
  align-self: flex-start;
  ${({ theme }) => theme.fonts.Title3};
`;
const Label2 = styled.label`
  align-self: flex-start;
  ${({ theme }) => theme.fonts.Title6};
  color: ${({ theme }) => theme.colors.Gray2};
  padding: 0.5rem 0px 0px 0px;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.2rem;
  border: 0.1rem solid ${({ theme }) => theme.colors.Gray2};
  border-radius: 1rem;
  box-sizing: border-box;
  font-weight: 500;
  background-color: ${({ theme }) => theme.colors.White};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const Select = styled.select`
  width: 100%;
  padding: 1.2rem;
  border: 0.1rem solid ${({ theme }) => theme?.colors?.Gray2};
  border-radius: 1rem;
  box-sizing: border-box;
  font-weight: 500;
  background-color: ${({ theme }) => theme.colors.White};
  color: ${({ theme }) => theme.colors.Gray0};
  appearance: none;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.MainBlue};
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 1.2rem;
  margin-top: 0.5rem;
`;

const InfoMessage = styled.p`
  color: ${({ theme }) => theme.colors.Gray1};
  font-size: 1.2rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.p`
  color: green;
  font-size: 1.2rem;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 1rem;
  ${({ theme }) => theme.fonts.Title4}
  font-weight: bold;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  background-color: ${({ $primary, theme }) =>
    $primary ? theme.colors.MainBlue : theme.colors.Gray2};
  color: ${({ $primary, theme }) => ($primary ? theme.colors.White : theme.colors.Gray0)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.Gray2};
    cursor: not-allowed;
  }
`;
