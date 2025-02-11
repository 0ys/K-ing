import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { IcCeleb, IcDrama, IcMovie, IcShow } from '../../assets/icons';
import { getCurationDetail, getCurationList } from '../../lib/curation';
import { SearchCategoryState, SearchQueryState } from '../../recoil/atom';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';
import CardListItem from '../Curation/CardListItem';
import Carousel from './Carousel';
import GenreButton from './GenreButton';
import Rank from './Rank';

const Home = () => {
  const [carouselList, setCarouselList] = useState([]);
  const [topCurations, setTopCurations] = useState([]);
  const [placeList, setPlaceList] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const setSearchQuery = useSetRecoilState(SearchQueryState);
  const setSearchCategory = useSetRecoilState(SearchCategoryState);
  const navigate = useNavigate();

  const genreIcons = [
    { icon: IcDrama, label: '드라마', contentType: 'drama' },
    { icon: IcMovie, label: '영화', contentType: 'movie' },
    { icon: IcShow, label: '예능', contentType: 'show' },
    { icon: IcCeleb, label: '인물', contentType: 'cast' },
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
        <Carousel carouselList={topCurations} />
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
            navigate('/search/result');
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
                <span onClick={() => navigate(`/curation/${topCurations[0].id}`)}>
                  {' '}
                  전체보기 {'>'}{' '}
                </span>
              </CurationHeader>
              <CardContainer>
                {placeList.map((place) => (
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
  align-items: flex-start;
  text-align: center;
  padding: 2rem;
  margin-bottom: 10rem;
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
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
    margin: 1rem 0;
  }
  span {
    cursor: pointer;

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
