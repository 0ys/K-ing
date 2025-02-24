import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import BadIcon from '../../assets/icons/bad.png';
import ClockIcon from '../../assets/icons/clock.png';
import GoodIcon from '../../assets/icons/good.png';
import LocationIcon from '../../assets/icons/location.png';
import { getShortAddress } from '../../util/addressFormat';

const ListItem = forwardRef(({ place, handleFocus }, ref) => {
  const { id: placeId, name, type, address, openHour, closedDay, imageUrl } = place;
  const isAlwaysOpen = closedDay === '연중무휴'; // 연중무휴 여부 확인

  return (
    <ItemContainer onClick={() => handleFocus(placeId)} ref={ref}>
      <TitleRow>
        <Title>{name}</Title>
        <Desc>{type}</Desc>
      </TitleRow>
      <InfoRow>
        {closedDay && (
          <ImportantInfoItem $isAlwaysOpen={isAlwaysOpen}>
            <img
              src={
                isAlwaysOpen
                  ? GoodIcon // 연중무휴 아이콘
                  : BadIcon // 기본 휴무 아이콘
              }
              alt={isAlwaysOpen ? 'Always Open' : 'Closed'}
            />
            {closedDay}
          </ImportantInfoItem>
        )}
        {address && (
          <InfoItem>
            <img src={LocationIcon} alt="Location" />
            {getShortAddress(address)}
          </InfoItem>
        )}
        {openHour && (
          <InfoItem>
            <img src={ClockIcon} alt="Open Hours" />
            {openHour}
          </InfoItem>
        )}
      </InfoRow>
      {imageUrl && <Image src={imageUrl} alt={name} />}
    </ItemContainer>
  );
});

const ItemContainer = styled.div`
  padding: 2.2rem;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 14px;
  cursor: pointer;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 4px;
`;

const Title = styled.h2`
  margin: 0;
  ${({ theme }) => theme.fonts.Title5};
  white-space: nowrap;
  overflow-x: auto; /* 캐러셀 효과 */
  scrollbar-width: none; /* 스크롤바 제거 (Firefox) */
  -ms-overflow-style: none; /* 스크롤바 제거 (IE/Edge) */

  &::-webkit-scrollbar {
    display: none; /* 스크롤바 제거 (Chrome/Safari) */
  }
`;

const Desc = styled.p`
  ${({ theme }) => theme.fonts.Body5};
  color: rgba(37, 37, 37, 0.7);
`;

const InfoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px 0px;
`;

const InfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  ${({ theme }) => theme.fonts.Body5};
  color: rgba(37, 37, 37, 0.7);

  img {
    width: 16px;
    height: 16px;
  }
`;

const ImportantInfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  ${({ theme }) => theme.fonts.Title6};
  color: ${(props) =>
    props.$isAlwaysOpen ? '#17A600' : props.theme.colors.Red}; /* 연중무휴일 때 색상 변경 */

  img {
    width: 16px;
    height: 16px;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 200px;
  border-radius: 8px;
  margin-top: 8px;
  object-fit: cover;
  display: block;
`;

export default ListItem;
