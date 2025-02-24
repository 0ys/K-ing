import styled from 'styled-components';

import SettingDetail from '../components/Setting/SettingDetail';

const SettingDetailPage = () => {
  return (
    <StSettingDetailPageWrapper>
      <SettingDetail />
    </StSettingDetailPageWrapper>
  );
};

export default SettingDetailPage;

const StSettingDetailPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
