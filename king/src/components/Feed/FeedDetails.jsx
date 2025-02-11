import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import SendIcon from '/src/assets/icons/chat-send.png';
import OptionIcon from '/src/assets/icons/option.png';

import { IcComments, IcHeartTrue, IcLikes } from '../../assets/icons';
import useModal from '../../hooks/common/useModal';
import useToggle from '../../hooks/common/useToggle';
import useGetComments from '../../hooks/post/useGetComments';
import { createComment, deletePost, getPostDetail, likePost, unLikePost } from '../../lib/post';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import { getRelativeDate } from '../../util/getRelativeDate';
import { getUserIdFromToken } from '../../util/getUserIdFromToken';
import { getUserInfoById } from '../../util/getUserInfoById';
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
  const [isOriginLan, setIsOriginLan] = useState(true);
  const [newComment, setNewComment] = useState('');

  const { reactionList, commentList, getNextData, isLoading, hasMore, mutate } =
    useGetComments(postId);

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
    const res = await getPostDetail(postId);
    setPostInfo(res);
    setWriter(res.writer);
  };

  useEffect(() => {
    getPostInfo();
  }, [postId]);

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
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      const res = await deletePost(postId);
      console.log(res);
      if (res.success) {
        alert('게시글이 삭제되었습니다.');
        navigate('/home');
      }
    } else {
      update.setShowing(false);
    }
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
      <Header>
        <IconText>
          <BackButton onBack={handleGoBack} />
          <h3>Post</h3>
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
      <UserInfo>
        <Profile style={{ backgroundImage: `url(${userInfo.imageUrl})` }} alt="default" />
        <UserName>{writer.nickname}</UserName>
      </UserInfo>

      <Location>{postInfo.place.name}</Location>
      <PostImageWrapper>
        <PostImage src={postInfo.imageUrl} alt="postImage" />
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
        Comments
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
        <NewCommentContainer>
          <Profile style={{ backgroundImage: `url(${writer.imageUrl})` }} alt="profile" />
          <CommentInput
            type="text"
            placeholder={`${writer.nickname}님에게 댓글 추가..`}
            value={newComment}
            onChange={handleCommentChange}
          />
          <SendButton onClick={handleCommentSubmit}>
            <img src={SendIcon} alt="sendBtn" />
          </SendButton>
        </NewCommentContainer>
      </CommentWrapper>
      <FooterWrapper>
        <PostDate>{getRelativeDate(postInfo.createdAt)}</PostDate>·
        <TranslateOption onClick={() => setIsOriginLan((prev) => !prev)}>
          {isOriginLan ? 'See translation' : 'See original'}
        </TranslateOption>
      </FooterWrapper>
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

const PostContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  padding: 0 2rem;

  gap: 1rem;
`;

const Header = styled.div`
  position: relative;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  margin-top: 2rem;

  width: 100%;
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
  right: 0;
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
  ${({ theme }) => theme.fonts.Title5};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const Location = styled.span`
  margin-left: 4rem;

  ${({ theme }) => theme.fonts.Body3};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const PostImageWrapper = styled.div`
  width: 100%;
  /* height: 30rem;

  display: flex;

  border: 1px solid ${({ theme }) => theme.colors.Gray2}; */
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
  height: 18rem;

  width: 100%;

  ${({ theme }) => theme.fonts.Title5};
  color: ${({ theme }) => theme.colors.Gray1};

  overflow-y: auto;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const CommentContainer = styled.div`
  height: 11rem;

  overflow-y: auto;
`;

const NewCommentContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;

  margin-top: 1rem;
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
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: 0.5rem;
  margin-bottom: 1rem;

  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray1};
`;

const PostDate = styled.div``;

const TranslateOption = styled.div``;
