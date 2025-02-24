import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { getUserIdFromToken } from '../../util/getUserIdFromToken';
import Nav from '../common/Nav';
import Loading from '../Loading/Loading';
import Profile from './Profile';

const User = () => {
  const { userId } = useParams(); // URL에서 userId 가져오기
  const myId = getUserIdFromToken(); // 공통 함수 사용

  const isMyPage = String(myId) === String(userId); // 내 페이지 여부 체크

  if (!userId) return <Loading />;

  return (
    <St.Container>
      <Profile isMyPage={isMyPage} userId={userId} />
      <Nav />
    </St.Container>
  );
};

export default User;

const St = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
  `,
};
