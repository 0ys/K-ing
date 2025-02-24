import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import LockIcon from '/src/assets/icons/lock.png';
import MapIcon from '/src/assets/icons/map.png';
import OptionIcon from '/src/assets/icons/option.png';
import OptionModal from '/src/components/common/OptionModal';

import useModal from '../../hooks/common/useModal';
import { addBookmark, removeBookmark } from '../../lib/bookmark';
import { deleteCuration, getCurationDetail } from '../../lib/curation';
import { CurationPlaceList } from '../../recoil/atom';
import { formatDate } from '../../util/formatDate';
import { getUserIdFromToken } from '../../util/getUserIdFromToken';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import Bottom from '../common/Bottom';
import Header from '../common/Header';
import ImageHeader from '../common/ImageHeader';
import DeleteModal from '../common/modal/DeleteModal';
import Loading from '../Loading/Loading';
import CardListItem from './CardListItem';
import FunctionButton from './FunctionButton';
import UserProfile from './UserProfile';

const CurationDetail = () => {
  const navigate = useNavigate();
  const { curationId } = useParams();
  const setPlaceList = useSetRecoilState(CurationPlaceList);
  const [curationData, setCurationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOptionVisible, setIsOptionVisible] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteModal = useModal();

  const [language, setLanguage] = useState(getLanguage());
  const { curation: curationTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  // 옵션 버튼
  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const fetchCurationData = async () => {
      try {
        const result = await getCurationDetail(curationId);
        setCurationData(result);
        setPlaceList(result.places);
      } finally {
        setLoading(false);
      }
    };

    fetchCurationData(curationData);
  }, [curationId, setPlaceList]);

  // 작성자가 아니면 헤더에 옵션 버튼이 보이지 않음
  useEffect(() => {
    if (curationData) {
      const currentUserId = Number(getUserIdFromToken());
      console.log(curationData.writer.userId, currentUserId);
      setIsOptionVisible(currentUserId !== null && curationData.writer.userId === currentUserId);
    }
  }, [curationData]);

  if (loading) return <Loading />;

  const handleRoute = () => {
    navigate(`/curation/map`);
  };

  const handleDeleteClick = async () => {
    //setIsDeleteModalOpen(true);
    deleteModal.setShowing(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCuration(curationId); // DELETE API 호출
      alert(curationTranslations.alertDeleteSuccess);
    } catch (error) {
      alert(curationTranslations.alertDeleteFailed);
    } finally {
      deleteModal.setShowing(false);
      navigate('/curation'); // 삭제 후 목록 페이지로 이동
    }
  };

  const handleEdit = () => {
    navigate(`/update/curation/${curationId}`);
  };

  const handleBookmarkClick = async () => {
    if (!curationData) return;

    // ✅ Optimistic UI 적용: 먼저 UI 업데이트
    const prevBookmarked = curationData.bookmarked;
    setCurationData((prev) => ({
      ...prev,
      bookmarked: !prev.bookmarked,
    }));

    try {
      if (prevBookmarked) {
        await removeBookmark(curationId);
      } else {
        await addBookmark(curationId);
      }
    } catch (error) {
      console.error('북마크 변경 실패:', error);
      // ❌ 실패하면 원래 상태로 복구
      setCurationData((prev) => ({
        ...prev,
        bookmarked: prevBookmarked,
      }));
    }
  };

  const handleHeader = () => {
    document.querySelector('html').scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container>
      <HeaderContainer onClick={handleHeader}>
        <Header title={curationData.title} />
        {isOptionVisible && (
          <OptionButton onClick={openModal}>
            <img src={OptionIcon} alt="Option" />
          </OptionButton>
        )}

        {/* 옵션 모달 */}
        <OptionModal
          isModalVisible={isModalVisible}
          onClick={closeModal}
          onDelete={handleDeleteClick}
          onUpdate={handleEdit}
        />
      </HeaderContainer>
      <ImageContainer>
        <ImageHeader src={curationData.imageUrl} alt={'CurationImage'} />
        {!curationData.public && (
          <LockButton>
            <img src={LockIcon} alt="isPublic" />
          </LockButton>
        )}
      </ImageContainer>

      <StDeleteModalWrapper $showing={deleteModal.isShowing}>
        <DeleteModal
          isShowing={deleteModal.isShowing}
          onClose={() => deleteModal.setShowing(false)}
          onConfirm={handleConfirmDelete}
        />
      </StDeleteModalWrapper>

      {/* 큐레이션 설명 */}
      <Content>
        <UserContainer>
          <UserProfile
            name={curationData.writer.nickname}
            date={formatDate(curationData.createdAt)}
            profileImage={curationData.writer.imageUrl}
            onClick={() => navigate(`/user/${curationData.writer.userId}`)}
          />
          <FunctionButton
            shareable={curationData.public}
            bookmarked={curationData.bookmarked}
            onBookmarkClick={handleBookmarkClick}
          />
        </UserContainer>
        <Description>{curationData.description}</Description>
      </Content>

      {/* 장소 모음 */}
      <PlaceList>
        {curationData.places.map((place) => (
          <CardListItem key={place.placeId} place={place} />
        ))}
        <Bottom />
      </PlaceList>

      <MapButton onClick={handleRoute}>
        <img src={MapIcon} alt="map" />
      </MapButton>
    </Container>
  );
};

const StDeleteModalWrapper = styled.div`
  display: ${({ $showing }) => ($showing ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;

  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100vh;

  background-color: rgba(0, 0, 0, 0.5);
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;

  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: ${({ theme }) => theme.colors.White};
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  position: absolute;
  right: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;

  img {
    height: 1.8rem;
  }
`;

const ImageContainer = styled.div`
  position: relative;
`;

const LockButton = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    height: 1.8rem;
    width: 1.8rem;
  }
`;

const Content = styled.div`
  padding: 1.5rem;
  position: relative;
`;

const Description = styled.div`
  padding: 2rem 0;
  ${({ theme }) => theme.fonts.Body2};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const UserContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
`;

const PlaceList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.2rem;
  padding: 0 0.5rem;
`;

const MapButton = styled.button`
  position: fixed;
  bottom: 4rem;
  right: 2rem;
  background-color: #fff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 1000;

  &:hover {
    background-color: #ccc;
  }

  img {
    width: 2.5rem;
    height: 2.5rem;
    object-fit: contain; /* 이미지가 왜곡되지 않도록 설정 */
  }
`;

export default CurationDetail;
