import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import BadIcon from '../../assets/icons/bad.png';
import ClockIcon from '../../assets/icons/clock.png';
import GoodIcon from '../../assets/icons/good.png';
import LocationIcon from '../../assets/icons/location.png';
import PenIcon from '../../assets/icons/pen.png';
import PhoneIcon from '../../assets/icons/phone.png';
import { formatDate } from '../../util/formatDate';
import { getLanguage, getTranslations } from '../../util/languageUtils';

const PlaceInfo = ({ placeData }) => {
  const [language, setLanguage] = useState(getLanguage());
  const { place: placeTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const { closedDay, address, openHour, phone, createdAt } = placeData;
  const isAlwaysOpen = closedDay === '연중무휴';

  return (
    <DetailContainer>
      <ImportantInfoItem $isAlwaysOpen={isAlwaysOpen}>
        <img
          src={isAlwaysOpen ? GoodIcon : BadIcon}
          alt={isAlwaysOpen ? 'Always Open' : 'Closed'}
        />
        {closedDay}
      </ImportantInfoItem>
      <Details>
        <img src={LocationIcon} alt="Location" /> &nbsp; {address}
      </Details>
      {!isAlwaysOpen && (
        <Details>
          <img src={ClockIcon} alt="Clock" /> &nbsp; {closedDay} {placeTranslations.break}
        </Details>
      )}
      <Details>
        <img src={ClockIcon} alt="Clock" /> &nbsp; {openHour}
      </Details>
      <Details>
        <img src={PhoneIcon} alt="Phone" /> &nbsp; {phone}
      </Details>
      {/* <Details>
        <img src={PenIcon} alt="Pen" /> &nbsp; {formatDate(createdAt)}
      </Details> */}
    </DetailContainer>
  );
};

const DetailContainer = styled.div`
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.2rem;

  img {
    width: 1.5rem;
  }
`;

const Details = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${({ theme }) => theme.fonts.Body2};
  color: ${({ theme }) => theme.colors.Gray1};
`;

const ImportantInfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  ${({ theme }) => theme.fonts.Title5};
  color: ${(props) => (props.$isAlwaysOpen ? '#17A600' : props.theme.colors.Red)};

  img {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

export default PlaceInfo;
