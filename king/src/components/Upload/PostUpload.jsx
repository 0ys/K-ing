import heic2any from 'heic2any';
import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import {
  IcImageUpload,
  IcImageUploadTrue,
  IcMarker2,
  IcToggleFalse,
  IcToggleTrue,
} from '../../assets/icons';
import useModal from '../../hooks/common/useModal';
import useToggle from '../../hooks/common/useToggle';
import {
  createPost,
  deletePostDraft,
  getPostDetail,
  getPostDraft,
  postDraft,
  updatePost,
} from '../../lib/post';
import { DraftExist, UseDraft } from '../../recoil/atom';
import BackButton from '../common/button/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import DraftModal from './Modal/DraftModal';

const PostUpload = ({ state }) => {
  const { postId } = useParams();
  const create = useModal();
  const toggle = useToggle(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [place, setPlace] = useState('');
  const [placeId, setPlaceId] = useState(0);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [isShareEnabled, setIsShareEnabled] = useState(false);

  const isDraft = useRecoilValue(DraftExist);
  const useDraft = useRecoilValue(UseDraft);

  useEffect(() => {
    if (isDraft) {
      create.setShowing(true);
    }
  }, [isDraft]);

  const initData = async () => {
    let res;

    if (postId) {
      //업데이트
      res = await getPostDetail(postId);
      setImage(res.imageUrl);
    } else if (isDraft && useDraft) {
      //초기 업로드
      res = await getPostDraft();
      if (res.imageData) {
        setImage(`data:image/jpeg;base64,${res.imageData}`);
      }
    } else {
      return;
    }

    setCaption(res.content ? res.content : '');
    if (res.place) {
      setPlaceId(res.place.placeId);
      setPlace(res.place.name);
    }

    toggle.setToggle(res.public);

    if (isDraft && useDraft) {
      await deletePostDraft();
    }
  };

  const saveDraft = async () => {
    if (imageFile || placeId || caption) {
      const draftInfo = { public: toggle.toggle };
      if (caption) {
        draftInfo.content = caption;
      }
      if (placeId !== 0) {
        draftInfo.placeId = placeId;
      }

      const res = await postDraft(draftInfo, imageFile);
      if (res.success) {
        alert('임시저장이 완료되었습니다.');
        navigate(`/home`);
      }
    }
  };

  const sharePost = async () => {
    if (isShareEnabled) {
      const postInfo = {
        content: caption,
        placeId,
        public: toggle.toggle,
      };

      const res = await createPost(postInfo, imageFile);
      if (res.data) {
        alert('게시물을 성공적으로 공유하였습니다.');

        navigate(`/feed/${res.data}`, { state: { from: { pathname: location.pathname } } });
      }
    }
  };

  const handleUpdatePost = async () => {
    if (isShareEnabled) {
      const postInfo = {
        content: caption,
        placeId,
        public: toggle.toggle,
      };

      const res = await updatePost(postId, postInfo, imageFile);

      if (res.success) {
        alert('게시물을 성공적으로 수정하였습니다.');

        navigate(`/feed/${postId}`, { state: { from: { pathname: location.pathname } } });
      }
    }
  };

  useEffect(() => {
    initData();
  }, [useDraft, postId]);

  useEffect(() => {
    setIsShareEnabled(!!image && !!placeId && !!caption);
  }, [image, placeId, caption]);

  const handlePlaceChange = (item) => {
    setPlaceId(item.originalId);
    setPlace(item.name);
  };

  const handleCaptionChange = (event) => {
    setCaption(event.target.value);
  };

  const handleToggle = () => {
    toggle.handleToggle();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // if (
    //   file.name.endsWith('.jpg') ||
    //   file.name.endsWith('.png') ||
    //   file.name.endsWith('.heic')
    // ) {
    //   alert('지원하지 않는 이미지 형식입니다.');
    //   event.target.type = '';
    //   event.target.type = 'file';
    //   return;
    // }

    if (file.size > 5 * 1024 * 1024) {
      //5MB
      alert('업로드 가능한 최대 용량은 5MB입니다. ');
      event.target.type = '';
      event.target.type = 'file';
      return;
    }

    if (file.name.endsWith('.heic') || file.name.endsWith('.heif')) {
      //heic 이미지 처리
      try {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
        });

        const newFilename = file.name.replace(/\.(heic|heif)$/i, '.jpg'); // Regex to replace both .heic and .heif
        const newFile = new File([convertedBlob], newFilename, {
          type: 'image/jpeg',
          lastModified: new Date().getTime(),
        });

        setImageFile(newFile);
        setImage(URL.createObjectURL(newFile));
      } catch (error) {
        console.error(error);
        alert('HEIC 파일 변환에 실패했습니다.');
      }
    } else {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <StHomeWrapper>
        <IconText>
          <BackButton />
          <p>새 인증샷</p>
        </IconText>

        <ImageUploadWrapper
          onClick={triggerFileInput}
          $isImage={image ? true : false}
          style={{ backgroundImage: `url(${image})` }}
        >
          <input
            type="file"
            accept="image/png, image/jpeg, image/heic"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          {image ? <IcImageUploadTrue /> : <IcImageUpload />}
          {image ? <h3>사진 재업로드하기</h3> : <h3>사진 업로드하기</h3>}
          <p>PNG, JPG 형식만 지원됩니다.</p>
        </ImageUploadWrapper>

        <SearchPlaceWrapper>
          <SearchBar type={'PLACE'} query={place} onSet={handlePlaceChange} />
          <div id="place">
            {place && <IcMarker2 />}
            <p>{place}</p>
          </div>
        </SearchPlaceWrapper>

        <CaptionInput
          placeholder="문구 추가.."
          value={caption}
          onChange={handleCaptionChange}
        ></CaptionInput>

        <PublicToggleWrapper>
          <h3>공개</h3>
          {toggle.toggle ? (
            <IcToggleTrue onClick={handleToggle} />
          ) : (
            <IcToggleFalse onClick={handleToggle} />
          )}
        </PublicToggleWrapper>
        {state === 'upload' ? (
          <ButtonWrapper>
            <TemporaryButton onClick={saveDraft}>임시 저장</TemporaryButton>
            <SaveButton disabled={!isShareEnabled} onClick={sharePost}>
              공유
            </SaveButton>
          </ButtonWrapper>
        ) : (
          <ButtonWrapper>
            <TemporaryButton onClick={() => navigate(-1)}>취소</TemporaryButton>
            <SaveButton disabled={!isShareEnabled} onClick={handleUpdatePost}>
              저장
            </SaveButton>
          </ButtonWrapper>
        )}
      </StHomeWrapper>

      <Nav />

      <StUploadModalWrapper $showing={create.isShowing}>
        <DraftModal isShowing={create.isShowing} handleCancel={create.toggle} />
      </StUploadModalWrapper>
    </>
  );
};

export default PostUpload;

const StHomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  text-align: center;

  padding: 2rem;
  margin-bottom: 7rem;

  gap: 1rem;
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;

  p {
    width: 100%;
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
  }
`;

const ImageUploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: 1rem;
  margin-top: 1rem;

  width: 100%;
  height: 20rem;
  position: relative;

  background-color: ${({ theme }) => theme.colors.Gray5};
  background-image: ${({ $imageUrl }) => ($imageUrl ? `url(${$imageUrl})` : 'none')};
  background-size: cover;
  background-position: center;
  border-radius: 1rem;

  cursor: pointer;

  ${({ $isImage }) =>
    $isImage &&
    `
    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4);
      border-radius: 1rem;
      z-index: 2;
    }
  `}

  svg {
    z-index: 3;
  }

  h3 {
    z-index: 1;

    color: ${({ theme, $isImage }) => ($isImage ? theme.colors.White : theme.colors.Gray0)};
    ${({ theme }) => theme.fonts.Title4};
    z-index: 3;
  }

  p {
    z-index: 1;
    color: ${({ theme, $isImage }) => ($isImage ? theme.colors.White : '#464656')};
    ${({ theme }) => theme.fonts.Body4};
    z-index: 3;
  }
`;

const CaptionInput = styled.textarea`
  width: 98%;
  height: 10rem;
  padding: 1rem;

  box-sizing: border-box;

  color: #626273;
  ${({ theme }) => theme.fonts.Body3};

  border: 1px solid ${({ theme }) => theme.colors.Gray2};
  border-radius: 1rem;
`;

const SearchPlaceWrapper = styled.div`
  width: 100%;

  #place {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;

    svg {
      width: 2rem;
      height: 2rem;

      margin-left: 1rem;
    }

    p {
      ${({ theme }) => theme.fonts.Body3};
      color: ${({ theme }) => theme.colors.Gray1};
    }
  }
`;

const PublicToggleWrapper = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  margin-top: 1rem;

  h3 {
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title6};
  }
`;

const ButtonWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-content: center;
  align-items: center;
  margin-top: 2rem;

  gap: 2rem;
  width: 100%;
`;

const TemporaryButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.Gray1};
  border-radius: 1rem;

  padding: 1rem 2rem;

  color: ${({ theme }) => theme.colors.Gray1};
  ${({ theme }) => theme.fonts.Body2};
`;

const SaveButton = styled.button`
  border-radius: 1rem;
  padding: 1rem 2rem;

  height: 100%;

  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ theme }) => theme.fonts.Body2};
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.Gray5 : theme.colors.MainBlue};
  color: ${({ theme, disabled }) => (disabled ? theme.colors.Gray2 : theme.colors.White)};
`;

const StUploadModalWrapper = styled.div`
  display: ${({ $showing }) => ($showing ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;

  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100vh;

  background-color: rgba(0, 0, 0, 0.5);
`;
