import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getLanguage, getTranslations } from '../../util/languageUtils';
import SearchItem from './SearchItem';

const SearchList = ({ title, data, type }) => {
  const language = getLanguage();
  const { archive: translations } = getTranslations(language);

  const navigate = useNavigate();
  const location = useLocation();

  const unit = title === translations.people ? translations.unit_person : translations.unit_item;

  const handleSearchDetail = () => {
    if (type === 'PLACE') {
      navigate(`/search/keyword`, { state: { from: { pathname: location.pathname } } });
    } else {
      navigate(`/search/detail/${type.toLowerCase()}`);
    }
  };

  // 10개 이상이면 '10+'로 표시
  const countDisplay = data.length >= 10 ? '10+' : data.length || 0;

  return (
    <St.Section>
      <St.Header>
        <St.Left>
          <St.Title>{title}</St.Title>
          <St.Count>
            {translations.itemsCount
              .replace('{countDisplay}', countDisplay)
              .replace('{unit}', unit)
              .replace('{type}', title)}
          </St.Count>
        </St.Left>
        <span onClick={handleSearchDetail}>
          {translations.showAllSimple} {'>'}{' '}
        </span>
      </St.Header>
      <St.List>
        {data.length > 0 ? (
          <>
            {data.map((item) => (
              <SearchItem key={item.id} item={item} type={type} />
            ))}
          </>
        ) : (
          <St.NoDataMessage>{translations.noSearchResults} 🥲</St.NoDataMessage>
        )}
      </St.List>
    </St.Section>
  );
};

export default SearchList;

const St = {
  Section: styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;

    width: 100%;

    box-sizing: border-box;
    padding: 0.5rem;
  `,
  Header: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      cursor: pointer;
    }
  `,
  Left: styled.div`
    display: flex;
    align-items: baseline;
    gap: 8px;
    align-items: center;
  `,
  NoDataMessage: styled.div`
    ${({ theme }) => theme.fonts.Body5};
    color: ${({ theme }) => theme.colors.Gray2};
    text-align: center;
    padding: 16px 0;
  `,
  Title: styled.h2`
    ${({ theme }) => theme.fonts.Title6};
  `,
  Count: styled.span`
    ${({ theme }) => theme.fonts.Body6};
    color: ${({ theme }) => theme.colors.Gray2};
  `,
  List: styled.div`
    display: flex;
    flex-direction: row;

    gap: 1rem;

    width: 100%;
    overflow-x: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
};
