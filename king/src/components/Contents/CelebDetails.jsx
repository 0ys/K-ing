import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import {
  IcBirth,
  IcMarker,
  IcMarker2,
  IcPencil,
  IcSmallStar,
  IcStar,
  IcStarBlank,
  IcTv,
} from '../../assets/icons';
import { getCelebDetails } from '../../lib/content';
import { addFavorite, removeFavorite } from '../../lib/favorites';
import { ContentId, ContentType, SearchQueryState, SearchRelatedType } from '../../recoil/atom';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import BackButton from '../common/button/BackButton';
import Nav from '../common/Nav';
import Loading from '../Loading/Loading';

const CelebDetails = () => {
  const language = getLanguage();
  const { content: translations } = getTranslations(language);

  const location = useLocation();
  const { celebId } = useParams();
  const [celebInfo, setCelebInfo] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayedWorks, setDisplayedWorks] = useState([]);

  const navigate = useNavigate();
  const setSearchQuery = useSetRecoilState(SearchQueryState);
  const setRelatedType = useSetRecoilState(SearchRelatedType);
  const contentType = useRecoilValue(ContentType);
  const setContentId = useSetRecoilState(ContentId);

  const getDetails = async () => {
    const res = await getCelebDetails(celebId);
    // console.log('api 응답 데이터', res);
    setCelebInfo(res);
    setIsFavorited(res.favorite);
  };

  const toggleFavorite = async () => {
    const success = isFavorited
      ? await removeFavorite('people', celebId)
      : await addFavorite('people', celebId);

    if (success) {
      setIsFavorited(!isFavorited);
    }
  };

  const handleClickPlaceInfo = () => {
    setSearchQuery(celebInfo.name);
    setRelatedType('cast');
    setContentId(celebId);

    navigate(`/search/keyword`);
  };

  const toggleWorkFavorite = async (event, contentId, currentFavorite) => {
    event.stopPropagation(); // 부모 클릭 이벤트 방지
    const success = currentFavorite
      ? await removeFavorite('content', contentId)
      : await addFavorite('content', contentId);

    if (success) {
      setCelebInfo((prev) => ({
        ...prev,
        relatedContents: prev.relatedContents.map((work) =>
          work.contentId === contentId ? { ...work, favorite: !currentFavorite } : work,
        ),
      }));
    }
  };

  const handleClickContent = (contentId) => {
    navigate(`/content/detail/${contentId}`);
  };

  const handleGoBack = () => {
    const from = location.state?.from?.pathname;

    if (from && (from.includes('/archive') || from.includes('/favorites'))) {
      navigate(-1);
    } else if (from && from.includes('/keyword' && contentType !== 'search')) {
      navigate(`/content/${contentType}`);
    } else if (contentType === 'search') {
      navigate(`/search/result`);
    } else if (contentType === 'autocom') {
      navigate(`/home`);
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    getDetails();
  }, [celebId]);

  useEffect(() => {
    if (celebInfo?.works) {
      setDisplayedWorks(isExpanded ? celebInfo.works : celebInfo.works.slice(0, 3));
    }
  }, [celebInfo, isExpanded]);

  if (!celebInfo) {
    return (
      <LoadingWrapper>
        <Loading />
      </LoadingWrapper>
    );
  }

  return (
    <>
      <CelebPageContainer>
        <IconText>
          <BackButton onBack={handleGoBack} />
          <p>{translations.details}</p>
        </IconText>

        <Header>
          <img
            id="poster"
            src={celebInfo.imageUrl ? celebInfo.imageUrl : '/src/assets/dummy/celeb_big.png'}
            alt="Celeb Poster"
          />
          <TitleSection>
            <h3>{celebInfo.name}</h3>
            {celebInfo.birthDate && (
              <IconText>
                <IcBirth />
                <p>{celebInfo.birthDate}</p>
              </IconText>
            )}
            {celebInfo.birthPlace && (
              <IconText>
                <IcMarker2 />
                <p>{celebInfo.birthPlace}</p>
              </IconText>
            )}
            <IconText>
              <IcTv />
              <p>
                {celebInfo.participatingWorks} {translations.work}
              </p>
            </IconText>
          </TitleSection>
          <BookmarkWrapper>
            {isFavorited ? (
              <IcStar id="favor" onClick={toggleFavorite} />
            ) : (
              <IcStarBlank id="favor" onClick={toggleFavorite} />
            )}
          </BookmarkWrapper>
        </Header>
        <Synopsis>
          <IconText>
            <IcSmallStar />
            <p>{translations.representativeWorks}</p>
          </IconText>
          <WorkGrid>
            {[...celebInfo.relatedContents]
              .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0)) // ✅ 즐겨찾기 우선 정렬
              .map((work) => (
                <Work key={work.contentId} onClick={() => handleClickContent(work.contentId)}>
                  <img src={work.imageUrl} alt="work Poster" />
                  <p>{work.title}</p>
                  {work.favorite ? (
                    <IcStar
                      id="favor"
                      onClick={(event) => toggleWorkFavorite(event, work.contentId, work.favorite)}
                    />
                  ) : (
                    <IcStarBlank
                      id="favor"
                      onClick={(event) => toggleWorkFavorite(event, work.contentId, work.favorite)}
                    />
                  )}
                </Work>
              ))}
          </WorkGrid>
        </Synopsis>

        <ListWrapper>
          <IconText>
            <IcPencil />
            <p>{translations.workActivity}</p>
          </IconText>
          <WorkWrapper>
            {displayedWorks.map((work) => (
              <WorkItem key={work.contentId}>
                <YearWrapper>{work.year}</YearWrapper>
                <Title onClick={() => handleClickContent(work.contentId)}>{work.title}</Title>
              </WorkItem>
            ))}

            {celebInfo.works?.length > 3 && (
              <ShowMoreButton onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? translations.collapse : translations.showMore}
              </ShowMoreButton>
            )}
          </WorkWrapper>
        </ListWrapper>
        <ActionButton onClick={handleClickPlaceInfo}>
          <IcMarker />
          <PlaceText>
            '{celebInfo.name.length > 5 ? ` ${celebInfo.name.slice(0, 5)}... ` : celebInfo.name}'{' '}
            {translations.filmingLocationOf}
          </PlaceText>
        </ActionButton>
      </CelebPageContainer>
      <Nav />
    </>
  );
};

export default CelebDetails;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
`;

const CelebPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  min-height: 80%;

  padding: 2rem;
  padding-bottom: 8rem;

  background-color: #fff;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const Header = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: end;
  margin-bottom: 2rem;
  margin-top: 1rem;

  min-height: 25rem;

  #poster {
    width: 50%;
    margin-right: 2rem;
  }

  #favor {
    position: absolute;
    right: 0;
    top: 0;

    width: 30px;
    height: 30px;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-top: 1rem;

  h3 {
    ${({ theme }) => theme.fonts.Title4};
  }

  p {
    ${({ theme }) => theme.fonts.Title5};
    color: ${({ theme }) => theme.colors.Gray0};
  }
`;

const BookmarkWrapper = styled.div`
  svg {
    cursor: pointer;
  }
`;

const Synopsis = styled.div`
  line-height: 1.6;
  margin-bottom: 2rem;

  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  p {
    width: 100%;
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
  }
`;

const WorkGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 0.5rem;

  width: 100%;
  height: 100%;

  overflow-x: auto;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Work = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  position: relative;

  flex: 0 0 104px;
  width: 10rem;
  height: auto;

  cursor: pointer;

  img {
    width: 100%;
    height: 80%;
    object-fit: cover;
  }

  p {
    width: 100%;
    text-align: center;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    margin-top: 0.5rem;
    ${({ theme }) => theme.fonts.Body2};
  }

  #favor {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;

    width: 2rem;
    height: 2rem;
  }
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
`;

const WorkItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  border-bottom: 1px solid ${({ theme }) => theme.colors.Gray3};
  padding-bottom: 0.7rem;
`;

const YearWrapper = styled.span`
  min-width: 4rem;
  text-align: right;
  display: inline-block;

  ${({ theme }) => theme.fonts.Body2};
  color: #868181;
`;

const Title = styled.p``;

const WorkWrapper = styled.ul`
  width: 100%;
  margin-top: 1rem;
  text-align: center;

  li {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    ${({ theme }) => theme.fonts.Body2};
    color: #868181;
  }

  p {
    cursor: pointer;
    margin-left: 5rem;
    ${({ theme }) => theme.fonts.Title6};
    color: ${({ theme }) => theme.colors.Gray1};
    text-decoration: underline;
  }

  hr {
    margin: 0.7rem 0;
    width: 90%;
    height: 1px;
    border: 0;
    background: ${({ theme }) => theme.colors.Gray3};
  }
`;

const ShowMoreButton = styled.button`
  margin-top: 0.5rem;

  ${({ theme }) => theme.fonts.Body5};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;

  margin: auto;
  margin-top: 2rem;
  margin-bottom: 2rem;

  border-radius: 1.5rem;
  padding: 0.8rem 2rem;

  text-align: center;
  width: 100%;

  background-image: linear-gradient(to right, #0062ff, #71c8ff);
  ${({ theme }) => theme.fonts.Title1};
  color: ${({ theme }) => theme.colors.White};

  p {
    margin-left: 1.5rem;
  }
`;

const PlaceText = styled.p`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
`;
