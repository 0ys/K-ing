import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { ContentType, SearchQueryState } from '../../recoil/atom';

const GenreButton = ({ buttonInfo }) => {
  const { icon: Icon, label, contentType } = buttonInfo;
  const [type, setContentType] = useRecoilState(ContentType);
  const setSearchQuery = useSetRecoilState(SearchQueryState);

  const navigate = useNavigate();

  return (
    <IconWrapper
      onClick={() => {
        setSearchQuery('');
        setContentType(contentType);
        navigate(`/content/${contentType}`);
      }}
    >
      <Icons>
        <Icon />
      </Icons>
      <p>{label}</p>
    </IconWrapper>
  );
};

export default GenreButton;

const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  & > p {
    ${({ theme }) => theme.fonts.Title7}
  }
`;

const Icons = styled.button`
  width: 100%;
  aspect-ratio: 1/1;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 1rem 0;
  border-radius: 1.6rem;
  background-color: ${({ theme }) => theme.colors.Beige};

  svg {
    width: 70%;
    height: 70%;
  }
`;
