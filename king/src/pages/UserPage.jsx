import styled from 'styled-components';

import User from '../components/User/User';

const UserPage = () => {
  return (
    <StUserPageWrapper>
      <User />
    </StUserPageWrapper>
  );
};

export default UserPage;

const StUserPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
