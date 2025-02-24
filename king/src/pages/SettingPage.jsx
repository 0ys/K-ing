import styled from 'styled-components';

import Setting from '../components/Setting/Setting';

const SettingPage = () => {
  return (
    <StSettingPageWrapper>
      <Setting />
    </StSettingPageWrapper>
  );
};

export default SettingPage;

const StSettingPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
