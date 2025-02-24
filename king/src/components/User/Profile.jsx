import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { IcRefresh } from '../../assets/icons';
import { getUserProfile } from '../../lib/user';
import { ActiveUserTabState, ProfileState } from '../../recoil/atom';
import GoUpButton from '../common/button/GoUpButton';
import Loading from '../Loading/Loading';
import CurationsList from './CurationsList';
import PostsList from './PostsList';
import ProfileHeader from './ProfileHeader';
import ProfileTabMenu from './ProfileTabMenu';
import SettingsButton from './SettingsButton';

function Profile({ isMyPage, userId }) {
  const [profileData, setProfileData] = useRecoilState(ProfileState);
  const [activeTab, setActiveTab] = useRecoilState(ActiveUserTabState);
  const [loading, setLoading] = useState(true);

  const tabMenuRef = useRef(null); // ProfileTabMenu 위치 감지
  const headerRef = useRef(null); // ProfileHeader 위치 감지
  const [isTabFixed, setIsTabFixed] = useState(false); // 탭 고정 여부 상태
  const [tabMenuHeight, setTabMenuHeight] = useState(0); // 탭 높이 저장
  const [originalOffsetTop, setOriginalOffsetTop] = useState(0); // 원래 위치 저장
  const [headerHeight, setHeaderHeight] = useState(0); // ProfileHeader 높이 저장

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(userId);
        if (isMounted) setProfileData(data.data);
      } catch (error) {
        if (isMounted) setProfileData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false; // 컴포넌트가 언마운트되면 API 요청 방지
    };
  }, [userId]);

  // 탭 메뉴 & ProfileHeader 높이 저장
  useEffect(() => {
    const updatePositions = () => {
      if (tabMenuRef.current) {
        setTabMenuHeight(tabMenuRef.current.offsetHeight);
        setOriginalOffsetTop(tabMenuRef.current.offsetTop);
      }
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
      // console.log(
      //   `📌 초기 위치 설정 완료 -> 탭 초기 위치: ${tabMenuRef.current?.offsetTop}, 헤더 높이: ${headerRef.current?.offsetHeight}`,
      // );
    };

    // 마운트 이후 100ms 지연 후 실행 -> 초기 렌더링 후 요소들이 제대로 배치된 후 값 가져오기
    setTimeout(updatePositions, 100);

    updatePositions(); // 초기 실행
    window.addEventListener('resize', updatePositions); // 창 크기 변경 시 업데이트

    return () => {
      window.removeEventListener('resize', updatePositions);
    };
  }, []);

  // 탭 메뉴 높이 & 원래 위치 저장 (화면 크기 변경 시에도 업데이트)
  useEffect(() => {
    const updateOriginalOffset = () => {
      if (tabMenuRef.current) {
        setTabMenuHeight(tabMenuRef.current.offsetHeight);
        setOriginalOffsetTop(tabMenuRef.current.offsetTop);
      }
    };

    updateOriginalOffset(); // 초기 실행
    window.addEventListener('resize', updateOriginalOffset); // 창 크기 변경 시 업데이트

    return () => {
      window.removeEventListener('resize', updateOriginalOffset);
    };
  }, []);

  // 스크롤 감지하여 ProfileTabMenu 고정하기 + 원래 위치 유지
  useEffect(() => {
    const handleScroll = () => {
      if (!tabMenuRef.current) return;

      const scrollTop = window.scrollY;
      const tabTop = tabMenuRef.current.getBoundingClientRect().top;
      // console.log(
      //   `스크롤 위치: ${scrollTop}, 탭 초기 위치: ${originalOffsetTop}, 헤더 높이: ${headerHeight}`,
      // );

      // 상단에 닿으면 `fixed` 적용
      if (scrollTop >= originalOffsetTop) {
        setIsTabFixed(true);
      }
      // ProfileHeader 영역에 다시 들어오면 `relative` 복귀
      else if (scrollTop <= originalOffsetTop - headerHeight) {
        setIsTabFixed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [originalOffsetTop, headerHeight]);

  if (loading) return <Loading />;

  if (!profileData) {
    return (
      <ErrorContainer>
        <RefreshButton onClick={() => window.location.reload()}>
          <IcRefresh />
        </RefreshButton>
      </ErrorContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeaderWrapper>
        <ProfileHeader user={profileData} isMyPage={isMyPage} />
        {isMyPage && <SettingsButton isMyPage={isMyPage} />}
      </ProfileHeaderWrapper>

      {/* 원래 자리 유지하기 위한 Spacer */}
      {isTabFixed && <Spacer height={tabMenuHeight} />}

      {/* ProfileTabMenu 감지 및 고정 */}
      <TabMenuWrapper ref={tabMenuRef} $isFixed={isTabFixed}>
        <ProfileTabMenu activeTab={activeTab} onTabChange={setActiveTab} />
      </TabMenuWrapper>

      {activeTab === 'posts' ? (
        <PostsList posts={profileData.posts || []} isMyPage={isMyPage} userId={userId} />
      ) : (
        <CurationsList
          curations={profileData.curations || []}
          isMyPage={isMyPage}
          userId={userId}
        />
      )}
      <GoUpButton />
    </ProfileContainer>
  );
}

export default Profile;

const ProfileContainer = styled.div`
  width: 100%;
  max-width: 60rem;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
`;

const ProfileHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between; /* 좌우 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  width: 100%;
  position: relative;
  box-sizing: border-box;
  padding: 1rem 2rem;
`;

// ProfileTabMenu를 감싸는 Wrapper (고정 스타일 추가)
const TabMenuWrapper = styled.div`
  position: ${({ $isFixed }) => ($isFixed ? 'fixed' : 'relative')};
  top: ${({ $isFixed }) => ($isFixed ? '0' : 'auto')};
  width: 100%;
  max-width: 39rem;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.White};
  z-index: 1000;
  transition: all 0.3s ease-in-out;
  box-shadow: ${({ $isFixed }) => ($isFixed ? '0px 2px 10px rgba(0, 0, 0, 0.1)' : 'none')};
`;

// 탭이 고정되었을 때 원래 자리 유지하는 Spacer 추가
const Spacer = styled.div`
  height: ${({ height }) => height}px;
`;

// 유저 정보를 불러오지 못했을 때의 스타일
const ErrorContainer = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const RefreshButton = styled.button`
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  font-size: 1.4rem;
  background-color: ${({ theme }) => theme.colors.Gray4};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.colors.Gray2};
  }
`;
