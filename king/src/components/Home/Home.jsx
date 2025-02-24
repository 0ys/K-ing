import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { IcCeleb, IcDrama, IcMovie, IcShow } from '../../assets/icons';
import { getCurationDetail, getCurationList } from '../../lib/curation';
import { SearchCategoryState, SearchQueryState } from '../../recoil/atom';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';
import CardListItem from '../Curation/CardListItem';
import Carousel from './Carousel';
import GenreButton from './GenreButton';
import Rank from './Rank';

const Home = () => {
  const location = useLocation();
  const language = getLanguage();
  const { home: translations } = getTranslations(language);

  const [carouselList, setCarouselList] = useState([]);
  const [topCurations, setTopCurations] = useState([]);
  const [placeList, setPlaceList] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const setSearchQuery = useSetRecoilState(SearchQueryState);
  const setSearchCategory = useSetRecoilState(SearchCategoryState);
  const navigate = useNavigate();

  const genreIcons = [
    { icon: IcDrama, label: translations.drama, contentType: 'drama' },
    { icon: IcMovie, label: translations.movie, contentType: 'movie' },
    { icon: IcShow, label: translations.show, contentType: 'show' },
    { icon: IcCeleb, label: translations.cast, contentType: 'cast' },
  ];

  useEffect(() => {
    const getResults = async () => {
      const res = await getCurationList('', '');
      setCarouselList(res.items);
    };
    getResults();
  }, []);

  useEffect(() => {
    if (carouselList.length > 0) {
      setTopCurations(carouselList.slice(0, Math.min(3, carouselList.length)));
    }
  }, [carouselList]);

  useEffect(() => {
    if (topCurations.length > 0) {
      const getCurationPlace = async () => {
        const res = await getCurationDetail(topCurations[0].id);
        setPlaceList(res.places);
      };
      getCurationPlace();
    }
  }, [topCurations]);

  if (!carouselList) {
    return null;
  }

  return (
    <>
      <StHomeWrapper>
        <TopNav />
        <CarouselWrapper>
          <Carousel carouselList={topCurations} />
        </CarouselWrapper>
        <GenreWrapper>
          {genreIcons.map((item) => (
            <GenreButton key={item.label} buttonInfo={item} />
          ))}
        </GenreWrapper>

        <SearchBar
          query=""
          onSearch={(query, category) => {
            setSearchQuery(query);
            setSearchCategory(category);
            if (query) {
              navigate('/search/result');
            }
          }}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />

        <Rank />
        <CurationWrapper>
          {topCurations.length > 0 && (
            <>
              <CurationHeader>
                <h3>{topCurations[0].title}</h3>
                <span
                  onClick={() =>
                    navigate(`/curation/${topCurations[0].id}`, { state: { from: location } })
                  }
                >
                  {' '}
                  {translations.showAll} {'>'}{' '}
                </span>
              </CurationHeader>
              <CardContainer>
                {placeList.slice(0, 4).map((place) => (
                  <CardListItem key={place.placeId} place={place} />
                ))}
              </CardContainer>
            </>
          )}
        </CurationWrapper>
      </StHomeWrapper>

      {!isSearchFocused && <Nav />}
    </>
  );
};

export default Home;

const StHomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  text-align: center;
  padding: 2rem;
  padding-bottom: 8rem;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const CarouselWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const GenreWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  width: 100%;
`;

const CurationWrapper = styled.div`
  width: 100%;
`;

const CurationHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  & > h3 {
    max-width: 20rem;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
    margin: 1rem 0;
  }
  span {
    cursor: pointer;
    min-width: fit-content;

    ${({ theme }) => theme.fonts.Body4};
  }
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;

  gap: 1rem;
  padding: 0.5rem 0;

  & > * {
    flex: 0 0 50%;
  }
  &::-webkit-scrollbar {
    display: none;
  }
`;
