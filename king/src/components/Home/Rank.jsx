import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { getKeywordRanking } from '../../lib/search';
import { SearchQueryState } from '../../recoil/atom';
import { getLanguage, getTranslations } from '../../util/languageUtils';

const Rank = () => {
  const navigate = useNavigate();

  const language = getLanguage();
  const { home: translations } = getTranslations(language);

  const [activeButton, setActiveButton] = useState('실시간');
  const [period, setPeriod] = useState('realtime');
  const [currentRankSet, setCurrentRankSet] = useState(0);
  const [rankingsData, setRankingsData] = useState([]);
  const [displayedRankings, setDisplayedRankings] = useState([]);

  const setQuery = useSetRecoilState(SearchQueryState);

  const periodOptions = [
    { label: translations.realtime, value: 'realtime' },
    { label: translations.daily, value: 'daily' },
    { label: translations.weekly, value: 'weekly' },
  ];

  //날짜 포맷
  const today = new Date();
  const formattedToday = `${today.getFullYear()}
    -${(today.getMonth() + 1).toString().padStart(2, '0')}
    -${today.getDate().toString().padStart(2, '0')}`;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

  const formatDate = (date) =>
    `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;

  const formattedStartOfWeek = formatDate(startOfWeek);
  const formattedEndOfWeek = formatDate(endOfWeek);

  const getFilterText = () => {
    switch (period) {
      case 'realtime':
        return translations.trendingNow;
      case 'daily':
        return formattedToday;
      case 'weekly':
        return `${formattedStartOfWeek} ~ ${formattedEndOfWeek}`;
      default:
        return '';
    }
  };

  const getRanking = async () => {
    const res = await getKeywordRanking(period);
    setRankingsData(res);
  };

  useEffect(() => {
    getRanking();
  }, [period]);

  useEffect(() => {
    if (rankingsData) {
      setDisplayedRankings(rankingsData.slice(currentRankSet * 4, currentRankSet * 4 + 4));
    }
  }, [rankingsData, currentRankSet]);

  useEffect(() => {
    setCurrentRankSet(0);

    const intervalId = setInterval(() => {
      if (rankingsData.length > 4) {
        setCurrentRankSet((prev) => (prev === 0 ? 1 : 0));
      } else {
        setCurrentRankSet(0);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [rankingsData]);

  const handleClickTrend = (keyword) => {
    setQuery(keyword);
    navigate(`/search/result`);
  };

  return (
    <>
      <TrendingKeyword>
        <h3>
          {translations.trendingSearch} <span>TOP 8</span>
        </h3>
        <div className="filter">
          <p>{getFilterText()}</p>
          <FilterControls>
            {periodOptions.map(({ label, value }) => (
              <StyledButton
                key={label}
                $active={activeButton === label}
                onClick={() => {
                  setActiveButton(label);
                  setPeriod(value);
                }}
              >
                {label}
              </StyledButton>
            ))}
          </FilterControls>
        </div>
        <div className="rankings">
          {displayedRankings.map((rank, index) => (
            <p key={index} onClick={() => handleClickTrend(rank.keyword)}>
              {index + 1 + currentRankSet * 4}. {rank.keyword}
            </p>
          ))}
        </div>
      </TrendingKeyword>
    </>
  );
};

export default Rank;

const TrendingKeyword = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 10px;
  background-color: #f2faff;

  h3 {
    text-align: left;
    ${({ theme }) => theme.fonts.Title6};
    margin: 1rem 1rem 0.5rem 1rem;
    padding: 0 0.5rem;

    & > span {
      ${({ theme }) => theme.fonts.Title6};
      color: ${({ theme }) => theme.colors.MainBlue};
    }
  }

  .filter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;
    p {
      margin: 0;
      ${({ theme }) => theme.fonts.Body6};
    }
  }

  .rankings {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin: 1rem;
    text-align: left;

    p {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      cursor: pointer;

      ${({ theme }) => theme.fonts.Body4};
      padding: 5px;
    }
  }
`;

const FilterControls = styled.div`
  display: flex;
`;

const StyledButton = styled.button`
  padding: 5px 10px;
  border-radius: 70px;
  background-color: ${({ $active }) => ($active ? '#D0E3FF' : '')};
  color: ${({ theme }) => theme.colors.Navy};
`;
