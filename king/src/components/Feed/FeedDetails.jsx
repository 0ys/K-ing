import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import SendIcon from '/src/assets/icons/chat-send.png';
import LockIcon from '/src/assets/icons/lock.png';
import OptionIcon from '/src/assets/icons/option.png';

import { IcComments, IcHeartTrue, IcLikes, IcMarker, IcMarker2 } from '../../assets/icons';
import useModal from '../../hooks/common/useModal';
import useToggle from '../../hooks/common/useToggle';
import useGetComments from '../../hooks/post/useGetComments';
import { createComment, deletePost, getPostDetail, likePost, unLikePost } from '../../lib/post';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import { getRelativeDate } from '../../util/getRelativeDate';
import { getUserIdFromToken } from '../../util/getUserIdFromToken';
import { getUserInfoById } from '../../util/getUserInfoById';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import BackButton from '../common/button/BackButton';
import OptionModal from '../common/OptionModal';
import Loading from '../Loading/Loading';
import Comment from './Comment';

const FeedDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const update = useModal();
  const lastElementRef = useRef(null);
  const toggle = useToggle();

  const userId = getUserIdFromToken();
  const [userInfo, setUserInfo] = useState(null);

  const [postInfo, setPostInfo] = useState(null);
  const [writer, setWriter] = useState(null);
  const [isOriginLan, setIsOriginLan] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [language, setLanguage] = useState(getLanguage());
  const { feed: feedTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const { reactionList, commentList, getNextData, isLoading, hasMore, mutate } = useGetComments(
    postId,
    isOriginLan,
  );

  //userInfo
  useEffect(() => {
    const getUserInfo = async () => {
      const userInfo = await getUserInfoById(userId);
      setUserInfo(userInfo);
    };

    getUserInfo();
  }, [userId]);

  useEffect(() => {
    if (reactionList && reactionList.comments) {
      toggle.setToggle(reactionList.liked);
    }
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  const handleGoBack = () => {
    //이전 경로 구하기
    const from = location.state?.from?.pathname;

    if (from && from.includes('/post')) {
      navigate('/home');
    } else {
      navigate(-1);
    }
  };

  const getPostInfo = async () => {
    const res = await getPostDetail(postId, isOriginLan);
    setPostInfo(res);
    setWriter(res.writer);
  };

  useEffect(() => {
    getPostInfo();
  }, [postId, isOriginLan]);

  const handleLikePost = async () => {
    toggle.handleToggle();

    if (!toggle.toggle) {
      //좋아요 요청
      const res = await likePost(postId);
      if (res.success) {
        mutate((pages) => {
          if (!pages) return [];

          const updatedPages = pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              liked: true,
              likesCount: page.data.likesCount + 1,
            },
          }));
          return updatedPages;
        }, false);
      }
    } else {
      const res = await unLikePost(postId);
      if (res.success) {
        mutate((pages) => {
          if (!pages) return [];

          const updatedPages = pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              liked: false,
              likesCount: page.data.likesCount - 1,
            },
          }));
          return updatedPages;
        }, false);
      }
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    const res = await createComment(postId, newComment);
    setNewComment('');
    if (res.success) {
      mutate();
    }
  };

  const handleUpdate = () => {
    navigate(`/update/post/${postId}`);
  };

  const handleDelete = async () => {
    if (window.confirm(feedTranslations.askDelete)) {
      const res = await deletePost(postId);
      console.log(res);
      if (res.success) {
        alert(feedTranslations.alertDelete);
        navigate('/home');
      }
    } else {
      update.setShowing(false);
    }
  };

  const handleUserClick = () => {
    navigate(`/user/${writer.userId}`);
  };

  const handleHeader = () => {
    document.querySelector('html').scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!postInfo) {
    return (
      <LoadingWrapper>
        <Loading />
      </LoadingWrapper>
    );
  }

  if (isLoading && !reactionList) return <Loading />;

  return (
    <PostContainer>
      <Header onClick={handleHeader}>
        <IconText>
          <BackButton onBack={handleGoBack} />
          <h3>{feedTranslations.title}</h3>
        </IconText>
        {userId === String(writer?.userId) && (
          <OptionButton
            onClick={() => {
              update.setShowing(true);
            }}
          >
            <img src={OptionIcon} alt="Option" />
          </OptionButton>
        )}
      </Header>
      <ContentWrapper>
        <UserInfo onClick={handleUserClick}>
          <Profile style={{ backgroundImage: `url(${writer.imageUrl})` }} alt="default" />
          <UserName>{writer.nickname}</UserName>
        </UserInfo>

        <Location
          onClick={() => {
            navigate(`/place/${postInfo.place.placeId}`);
          }}
        >
          <IcMarker2 />
          {postInfo.place.name}
        </Location>
        <PostImageWrapper>
          <PostImage src={postInfo.imageUrl} alt="postImage" />
          {!postInfo.public && (
            <LockButton>
              <img src={LockIcon} alt="isPublic" />
            </LockButton>
          )}
        </PostImageWrapper>

        <PostCount>
          <LikeCount>
            {toggle.toggle ? (
              <IcHeartTrue onClick={handleLikePost} />
            ) : (
              <IcLikes onClick={handleLikePost} />
            )}
            {reactionList && reactionList.likesCount}
          </LikeCount>
          <CommentCount>
            <IcComments />
            {reactionList && reactionList.commentsCount}
          </CommentCount>
        </PostCount>

        <PostCaption>{postInfo.content}</PostCaption>

        <CommentWrapper>
          {feedTranslations.commentTitle}
          <CommentContainer>
            {commentList &&
              commentList.map((comment, index) => (
                <Comment
                  key={comment.commentId}
                  data={comment}
                  ref={index === commentList?.length - 1 ? lastElementRef : null}
                />
              ))}
          </CommentContainer>
        </CommentWrapper>
      </ContentWrapper>

      <FootWrapper>
        <NewCommentContainer>
          <Profile style={{ backgroundImage: `url(${userInfo.imageUrl})` }} alt="profile" />
          <CommentInput
            type="text"
            const
            placeholder={feedTranslations.commentInput}
            value={newComment}
            onChange={handleCommentChange}
          />
          <SendButton onClick={handleCommentSubmit}>
            <img src={SendIcon} alt="sendBtn" />
          </SendButton>
        </NewCommentContainer>
        <FooterWrapper>
          <PostDate>{getRelativeDate(postInfo.createdAt)}</PostDate>·
          <TranslateOption onClick={() => setIsOriginLan((prev) => !prev)}>
            {isOriginLan ? feedTranslations.seeTranslate : feedTranslations.seeOriginal}
          </TranslateOption>
        </FooterWrapper>
      </FootWrapper>
      <OptionModal
        isModalVisible={update.isShowing}
        onClick={() => {
          update.setShowing(false);
        }}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </PostContainer>
  );
};

export default FeedDetails;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
`;

const PostContainer = styled.div``;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  gap: 1rem;

  padding: 0 2rem;
  padding-top: 1rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  padding: 2rem 2rem 1rem 2rem;
  box-sizing: border-box;
  width: 100%;

  position: sticky;
  top: 0;
  z-index: 1000;

  box-shadow: 0 1px rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.colors.White};
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;

  h3 {
    width: 100%;
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title3};
  }
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  position: absolute;
  right: 2rem;
  background: none;
  border: none;
  cursor: pointer;

  img {
    height: 1.8rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
`;

const Profile = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;

  background-size: cover;
  background-position: center;
`;

const UserName = styled.span`
  max-width: 25rem;

  ${({ theme }) => theme.fonts.Title5};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const Location = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  margin-left: 4rem;

  ${({ theme }) => theme.fonts.Body3};
  color: ${({ theme }) => theme.colors.Gray0};

  cursor: pointer;

  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const PostImageWrapper = styled.div`
  width: 100%;

  position: relative;
`;

const LockButton = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;

  background-color: rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    height: 1.8rem;
    width: 1.8rem;
  }
`;

const PostImage = styled.img`
  width: 100%;
  /* max-height: 30rem; */

  object-fit: contain;
`;

const PostCount = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: 1rem;
`;

const LikeCount = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: 0.5rem;

  ${({ theme }) => theme.fonts.Title5};
  color: ${({ theme }) => theme.colors.Gray1};

  svg {
    cursor: pointer;
  }
`;

const CommentCount = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: 0.5rem;

  ${({ theme }) => theme.fonts.Title5};
  color: ${({ theme }) => theme.colors.Gray1};
`;

const PostCaption = styled.div`
  ${({ theme }) => theme.fonts.Body3};
  color: ${({ theme }) => theme.colors.Gray1};
`;

const CommentWrapper = styled.div`
  position: relative;

  width: 100%;

  ${({ theme }) => theme.fonts.Title5};
  color: ${({ theme }) => theme.colors.Gray1};

  overflow-y: auto;

  ::-webkit-scrollbar {
    display: none;
  }

  padding-bottom: 1rem;
`;

const CommentContainer = styled.div`
  overflow-y: auto;
`;

const FootWrapper = styled.div`
  width: 88%;
  padding: 0 2rem;
`;

const NewCommentContainer = styled.div`
  position: sticky;
  bottom: 2rem;
  z-index: 1000;

  width: 100%;
  background-color: ${({ theme }) => theme.colors.White};

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;

  padding: 1rem 0;
`;

const CommentInput = styled.input`
  height: 2rem;
  flex-grow: 1;
  padding: 0.5rem 1rem;

  border: 1px solid ${({ theme }) => theme.colors.Gray2};
  border-radius: 1rem;
  outline: none;
`;

const SendButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 2rem;
  padding: 1.5rem;

  border-radius: 1rem;
  cursor: pointer;

  background-color: ${({ theme }) => theme.colors.MainBlue};

  img {
    width: 1.5rem;
  }
`;

const FooterWrapper = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 1000;

  width: 100%;

  background-color: ${({ theme }) => theme.colors.White};

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;

  gap: 0.5rem;
  padding-bottom: 1rem;

  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray1};
`;

const PostDate = styled.div``;

const TranslateOption = styled.div``;
