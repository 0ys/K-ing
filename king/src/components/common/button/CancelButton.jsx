import { styled } from 'styled-components';

import { StConfirmButtonWrapper } from './ConfirmButton';

const CancelButton = ({ btnName, onClick }) => {
  return (
    <StCancelButtonWrapper type="button" onClick={onClick}>
      {btnName}
    </StCancelButtonWrapper>
  );
};

export default CancelButton;

const StCancelButtonWrapper = styled(StConfirmButtonWrapper)`
  background-color: #e48383;
`;
