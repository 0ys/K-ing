import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcSetting } from '../../assets/icons';

const SettingsButton = ({ isMyPage }) => {
  const navigate = useNavigate();

  if (!isMyPage) return null;

  const handleSettingClick = () => {
    navigate(`/setting`);
  };
  return (
    <Button onClick={handleSettingClick}>
      <IcSetting />
    </Button>
  );
};

export default SettingsButton;

const Button = styled.button`
  position: absolute; /* ✅ ProfileHeaderWrapper 내부에서 우측 상단 배치 */
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  z-index: 10;
`;
