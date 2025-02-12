import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import {
  IcMan,
  IcMarker,
  IcMarker2,
  IcPencil,
  IcStar,
  IcStarBlank,
  IcTv,
} from '../../assets/icons';
import { getContentDetails } from '../../lib/content';
import { ContentId, ContentType, SearchQueryState, SearchRelatedType } from '../../recoil/atom';
import { convertLowerCase } from '../../util/changeStrFormat';
import { getContentTypeKor } from '../../util/getContentType';
import BackButton from '../common/button/BackButton';
import Loading from '../Loading/Loading';

const ContentDetails = () => {
  const { contentId } = useParams();
  const [contentInfo, setContentInfo] = useState(null);
  const [typeKor, setTypeKor] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  const setSearchQuery = useSetRecoilState(SearchQueryState);
  const setRelatedType = useSetRecoilState(SearchRelatedType);
  const contentType = useRecoilValue(ContentType);
  const setContentId = useSetRecoilState(ContentId);

  const navigate = useNavigate();
  const location = useLocation();

  const handleClickCast = (celebId) => {
    navigate(`/content/cast/${celebId}`);
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const getDetails = async () => {
    const res = await getContentDetails(contentId);
    setContentInfo(res);
    setTypeKor(getContentTypeKor(convertLowerCase(res.type)));
    setIsFavorited(res.favorite);
  };

  const handleGoBack = () => {
    const from = location.state?.from?.pathname;

    if (from && (from.includes('/archive') || from.includes('/favorites'))) {
      navigate(-1);
    }

    if (contentType === 'search') {
      navigate(`/search/result`);
    } else if (contentType === 'autocom') {
      navigate(`/home`);
    } else {
      navigate(`/content/${contentType}`);
    }
  };

  const handleClickPlaceInfo = () => {
    setSearchQuery(contentInfo.title);
    setRelatedType('content');
    setContentId(contentId);

    navigate(`/search/keyword`);
  };

  useEffect(() => {
    getDetails();
  }, [contentId]);

  if (!contentInfo) {
    return (
      <LoadingWrapper>
        <Loading />
      </LoadingWrapper>
    );
  }

  return (
    <>
      <DramaPageContainer>
        <IconText>
          <BackButton onBack={handleGoBack} />
          <p> 세부정보</p>
        </IconText>
        <Header>
          <img
            id="poster"
            src={contentInfo.imageUrl ? contentInfo.imageUrl : '/src/assets/dummy/poster1.png'}
            alt="Poster"
          />
          <TitleSection>
            <h3>{contentInfo.title}</h3>
            <IconText>
              <IcTv />
              <p>{typeKor}</p>
            </IconText>
            {contentInfo.broadcast && (
              <IconText>
                <IcMarker2 />
                <p>{contentInfo.broadcast}</p>
              </IconText>
            )}
          </TitleSection>
          <BookmarkWrapper>
            {isFavorited ? (
              <IcStar id="favor" onClick={toggleFavorite} />
            ) : (
              <IcStarBlank id="favor" onClick={toggleFavorite} />
            )}
          </BookmarkWrapper>
        </Header>

        {contentInfo.description && (
          <Synopsis>
            <IconText>
              <IcPencil />
              <p>소개</p>
            </IconText>
            {contentInfo.description}
          </Synopsis>
        )}

        <IconText>
          <IcMan />
          <p>등장인물</p>
        </IconText>
        <CastGrid>
          {contentInfo.relatedCasts.map((cast) => (
            <CastMember
              key={cast.castId}
              onClick={() => {
                handleClickCast(cast.castId);
              }}
            >
              <img src={cast.imageUrl} alt="Cast" />
              <p>{cast.name}</p>
              {cast.favorite ? (
                <IcStar id="favor" onClick={toggleFavorite} />
              ) : (
                <IcStarBlank id="favor" onClick={toggleFavorite} />
              )}
            </CastMember>
          ))}
        </CastGrid>
      </DramaPageContainer>
      <ActionButton onClick={handleClickPlaceInfo}>
        <IcMarker />
        <p>촬영지 알아보기</p>
      </ActionButton>
    </>
  );
};

export default ContentDetails;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
`;

const DramaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  padding: 2rem;
  background-color: #fff;

  min-height: 80%;
`;

const Header = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: end;
  margin-bottom: 2rem;
  margin-top: 1rem;

  min-height: 30vh;

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
  margin-top: 10px;

  h3 {
    ${({ theme }) => theme.fonts.Title4};
    margin-bottom: 1rem;
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
  align-items: center;
  gap: 0.7rem;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  p {
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
  }
`;

const CastGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 0.5rem;

  width: 100%;
  overflow-x: auto;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CastMember = styled.div`
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

const ActionButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  margin: auto;
  margin-bottom: 2rem;

  border-radius: 20px;
  padding: 0.8rem 2rem;

  text-align: center;

  background-image: linear-gradient(to right, #0062ff, #71c8ff);
  ${({ theme }) => theme.fonts.Head2};
  color: ${({ theme }) => theme.colors.White};

  p {
    margin-left: 1.5rem;
  }
`;
