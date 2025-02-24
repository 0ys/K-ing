import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import SortingIcon from '../../assets/icons/icon-sorting.png';
import SortingModal from '../../components/common/SortingModal';
import { getLanguage, getTranslations } from '../../util/languageUtils';

const SortingRow = ({ onSortingChange }) => {
  const [language, setLanguage] = useState(getLanguage());
  const { review: reviewTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [value, setValue] = useState(reviewTranslations.latest);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleOptionClick = (option) => {
    setValue(option); // 선택된 옵션 업데이트
    onSortingChange(option);
    closeModal(); // 모달 닫기
  };

  return (
    <>
      <SortingContainer>
        <SortingButton onClick={openModal}>
          <img src={SortingIcon} alt="Sorting" />
          <SortingTitle>{value}</SortingTitle>
        </SortingButton>
      </SortingContainer>
      <SortingModal
        isModalVisible={isModalVisible}
        onCloseClick={closeModal}
        onOptionClick={handleOptionClick}
      />
    </>
  );
};

const SortingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  padding: 1rem;
`;

const SortingButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;

  img {
    width: 1.6rem;
  }
`;

const SortingTitle = styled.div`
  ${({ theme }) => theme.fonts.Title6};
  color: ${({ theme }) => theme.colors.MainBlue};
`;

export default SortingRow;
