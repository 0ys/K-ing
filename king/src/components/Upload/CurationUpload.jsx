import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { IcImageUpload, IcImageUploadTrue, IcToggleFalse, IcToggleTrue } from '../../assets/icons';
import useModal from '../../hooks/common/useModal';
import useToggle from '../../hooks/common/useToggle';
import {
  createCuration,
  deleteCurationDraft,
  getCurationDetail,
  getCurationDraft,
  postCurationDraft,
  updateCuration,
} from '../../lib/curation';
import {
  AutoDraft,
  CurationDraftExist,
  CurationImage,
  CurationPlaceUploadList,
  UseDraft,
  UseUpdateData,
} from '../../recoil/atom';
import { convertHeicToJpeg } from '../../util/convertHeicToJpeg';
import { convertToBlob } from '../../util/convertToBlob';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import BackButton from '../common/button/BackButton';
import RemoveButton from '../common/button/RemoveButton';
import Nav from '../common/Nav';
import DraftModal from './Modal/DraftModal';
import UploadingModal from './Modal/UploadingModal';

const CurationUpload = ({ state }) => {
  const { curationId } = useParams();
  const create = useModal();
  const upload = useModal();
  const toggle = useToggle(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [placeList, setPlaceList] = useRecoilState(CurationPlaceUploadList);
  const [placeIds, setPlaceIds] = useState([]);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isShareEnabled, setIsShareEnabled] = useState(false);

  const isDraft = useRecoilValue(CurationDraftExist);
  const setCurationDraftExist = useSetRecoilState(CurationDraftExist);
  const useDraft = useRecoilValue(UseDraft);
  const setUseDraft = useSetRecoilState(UseDraft);
  const [autoDraft, setAutoDraft] = useRecoilState(AutoDraft);
  const [isUpdateLoaded, setIsUpdateLoaded] = useRecoilState(UseUpdateData);
  const [curationImage, setCurationImage] = useRecoilState(CurationImage);

  const [language, setLanguage] = useState(getLanguage());
  const { curation: curationTranslations } = getTranslations(language);

  // 언어 변경 시 상태 업데이트
  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getLanguage());
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  useEffect(() => {
    if (placeList.length > 0) {
      setPlaceIds(placeList.map((place) => place.placeId));
    }
  }, [placeList]);

  useEffect(() => {
    if (isDraft && !curationId) {
      create.setShowing(true);
    }
  }, [isDraft]);

  const initFlag = () => {
    setPlaceList([]);
    setAutoDraft(false);
    setIsUpdateLoaded(false);
  };

  const initData = async () => {
    let res;
    if (curationId && !isUpdateLoaded) {
      res = await getCurationDetail(curationId);
      setImage(res.imageUrl);
      setCurationImage(res.imageUrl);
      setIsUpdateLoaded(true);
    } else if ((isDraft && useDraft) || autoDraft) {
      res = await getCurationDraft();
      if (isUpdateLoaded) {
        setImage(curationImage);
      } else if (res.imageData) {
        setImage(`data:image/jpeg;base64,${res.imageData}`);
        setImageFile(convertToBlob(res.imageData, 'image/jpeg'));
      }
    } else {
      return;
    }

    setTitle(res.title ? res.title : '');
    setDescription(res.description ? res.description : '');
    if (res.places && !autoDraft) {
      setPlaceList(res.places);
    }

    toggle.setToggle(res.public);

    if ((isDraft && useDraft) || autoDraft) {
      await deleteCurationDraft();
      setCurationDraftExist(false);
      setAutoDraft(false);
      setUseDraft(false);
    }
  };

  useEffect(() => {
    //if (!useDraft) return;
    initData();
  }, [useDraft, curationId]);

  const saveDraft = async () => {
    if (imageFile || placeIds.length > 0 || title || description) {
      const draftInfo = { public: toggle.toggle };
      if (title) {
        draftInfo.title = title;
      }
      if (description) {
        draftInfo.description = description;
      }
      if (placeIds.length > 0) {
        draftInfo.placeIds = placeIds;
      }
      //console.log(imageFile);
      const res = await postCurationDraft(draftInfo, imageFile);
      if (res.success) {
        alert(curationTranslations.alertDraftSaved);
        setCurationDraftExist(true);
        initFlag();
        navigate(`/home`);
      }
    }
  };

  const autoSaveDraft = async () => {
    if (imageFile || placeIds.length > 0 || title || description) {
      const draftInfo = { public: toggle.toggle };
      if (title) draftInfo.title = title;
      if (description) draftInfo.description = description;
      if (placeIds.length > 0) draftInfo.placeIds = placeIds;

      const res = await postCurationDraft(draftInfo, imageFile); // 백그라운드 저장
      if (res.success) {
        setAutoDraft(true);
      }
    }
  };

  const shareCuration = async () => {
    if (isShareEnabled) {
      const curationInfo = {
        title,
        description,
        placeIds,
        public: toggle.toggle,
      };

      upload.setShowing(true);
      const res = await createCuration(curationInfo, imageFile);
      upload.setShowing(false);

      if (res.data) {
        initFlag();
        navigate(`/curation/${res.data.curationListId}`, {
          state: { from: { pathname: 'upload' } },
        });
      }
    }
  };

  const handleUpdateCuration = async () => {
    if (isShareEnabled) {
      //console.log(placeIds);
      const curationInfo = {
        title,
        description,
        placeIds,
        public: toggle.toggle,
      };

      upload.setShowing(true);
      const res = await updateCuration(curationId, curationInfo, imageFile);
      upload.setShowing(false);

      if (res.success) {
        initFlag();
        navigate(`/curation/${curationId}`, { state: { from: { pathname: 'update' } } });
      }
    }
  };

  useEffect(() => {
    setIsShareEnabled(
      !!image && placeIds.length > 0 && placeList.length > 0 && !!title && !!description,
    );
  }, [image, placeIds, placeList, title, description]);

  const handleTitleChange = (event) => {
    const inputValue = event.target.value;

    if (inputValue.length <= 50) {
      setTitle(inputValue);
    }
  };

  const handleDescChange = (event) => {
    const inputValue = event.target.value;

    if (inputValue.length <= 1000) {
      setDescription(inputValue);
    }
  };

  const handleToggle = () => {
    toggle.handleToggle();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // if (
    //   !file.name.toLowerCase().endsWith('.jpg') &&
    //   !file.name.toLowerCase().endsWith('.png') &&
    //   !file.name.toLowerCase().endsWith('.heic') &&
    //   !file.name.toLowerCase().endsWith('.gif')
    // ) {
    //   alert('지원하지 않는 이미지 형식입니다.');
    //   event.target.type = '';
    //   event.target.type = 'file';
    //   return;
    // }

    if (file.size > 5 * 1024 * 1024) {
      //5MB
      alert(postTranslations.alertMaxSizeExceeded);
      event.target.type = '';
      event.target.type = 'file';
      return;
    }

    if (file.name.endsWith('.heic') || file.name.endsWith('.heif')) {
      //heic 이미지 처리
      const newFile = await convertHeicToJpeg(file);
      if (newFile) {
        setImageFile(newFile);
        setImage(URL.createObjectURL(newFile));
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

  const handleCurationClick = (id) => {
    //navigate(`/place/${id}`);
  };

  const handlePlaceDelete = (id) => {
    setPlaceList((prevPlaces) => prevPlaces.filter((place) => place.placeId !== id));
  };

  const handleAddPlace = () => {
    navigate('/upload/curation/place');
  };

  const handelBack = () => {
    initFlag();
    navigate(-1);
  };

  return (
    <>
      <StUploadWrapper>
        <IconText>
          <BackButton onBack={handelBack} />
          <p>{curationTranslations.title}</p>
          {state === 'upload' ? (
            <ButtonWrapper>
              <TemporaryButton onClick={saveDraft}>{curationTranslations.draft}</TemporaryButton>
              <SaveButton disabled={!isShareEnabled} onClick={shareCuration}>
                {curationTranslations.upload}
              </SaveButton>
            </ButtonWrapper>
          ) : (
            <ButtonWrapper>
              <TemporaryButton onClick={handelBack}>{curationTranslations.cancel}</TemporaryButton>
              <SaveButton disabled={!isShareEnabled} onClick={handleUpdateCuration}>
                {curationTranslations.save}
              </SaveButton>
            </ButtonWrapper>
          )}
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
          {image ? (
            <h3>{curationTranslations.reuploadPhoto}</h3>
          ) : (
            <h3>{curationTranslations.uploadPhoto}</h3>
          )}
          <p>{curationTranslations.photoDesc}</p>
        </ImageUploadWrapper>
        <TitleInput
          placeholder={curationTranslations.titlePlaceholder}
          value={title}
          onChange={handleTitleChange}
          maxLength={150}
        ></TitleInput>
        {title.length} / 50
        <DescInput
          placeholder={curationTranslations.descPlaceholder}
          value={description}
          onChange={handleDescChange}
          maxLength={1000}
        ></DescInput>
        {description.length} / 1000
        <PublicToggleWrapper>
          <h3>{curationTranslations.public}</h3>
          {toggle.toggle ? (
            <IcToggleTrue onClick={handleToggle} />
          ) : (
            <IcToggleFalse onClick={handleToggle} />
          )}
        </PublicToggleWrapper>
      </StUploadWrapper>

      <PlaceWrapper>
        <AddButton
          onClick={() => {
            autoSaveDraft();
            handleAddPlace();
          }}
        >
          + {curationTranslations.addPlace}
        </AddButton>
        <PlaceList>
          {placeList.map((place) => (
            <CardContainer key={place.placeId} onClick={() => handleCurationClick(place.placeId)}>
              <ImageContainer>
                {place.imageUrl && <Image src={place.imageUrl} alt={place.name} />}
                <RemoveButton onClick={() => handlePlaceDelete(place.placeId)} />
              </ImageContainer>

              <TextContainer>{place.name && <Title>{place.name}</Title>}</TextContainer>
            </CardContainer>
          ))}
        </PlaceList>
      </PlaceWrapper>

      <Nav />

      <StUploadModalWrapper $showing={create.isShowing}>
        <DraftModal isShowing={create.isShowing} handleCancel={create.toggle} />
      </StUploadModalWrapper>
      <StUploadModalWrapper $showing={upload.isShowing}>
        <UploadingModal isShowing={upload.isShowing} />
      </StUploadModalWrapper>
    </>
  );
};

export default CurationUpload;

const PlaceList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.2rem;
  padding: 0 0.5rem;
  margin-top: 2rem;
  margin-bottom: 10rem;
`;

const StUploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  padding-top: 2rem;

  gap: 1rem;
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;

  width: 100%;
  box-sizing: border-box;
  padding: 0 1rem;

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

  width: 100%;
  height: 20rem;
  position: relative;

  background-color: ${({ theme }) => theme.colors.Gray5};
  background-image: ${({ $imageUrl }) => ($imageUrl ? `url(${$imageUrl})` : 'none')};
  background-size: cover;
  background-position: center;
  border-radius: 0 0 1rem 1rem;

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
      border-radius: 0 0 1rem 1rem;
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

const TitleInput = styled.textarea`
  width: 95%;
  height: 5rem;

  box-sizing: border-box;
  padding: 1.5rem;

  color: #626273;
  ${({ theme }) => theme.fonts.Body3};

  border: 1px solid ${({ theme }) => theme.colors.Gray2};
  border-radius: 1.5rem;
`;

const DescInput = styled.textarea`
  width: 95%;
  height: 15rem;

  box-sizing: border-box;
  padding: 1.5rem;

  color: #626273;
  ${({ theme }) => theme.fonts.Body3};

  border: 1px solid ${({ theme }) => theme.colors.Gray2};
  border-radius: 2rem;
`;

const PublicToggleWrapper = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  padding: 0 2rem;
  box-sizing: border-box;

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

  gap: 1rem;
  width: 100%;
`;

const TemporaryButton = styled.button`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.Gray1};
  border-radius: 1rem;

  padding: 0.5rem;

  color: ${({ theme }) => theme.colors.Gray1};
  ${({ theme }) => theme.fonts.Body4};
`;

const SaveButton = styled.button`
  border-radius: 1rem;
  padding: 0.5rem;

  height: 100%;
  width: 100%;

  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${({ theme }) => theme.fonts.Body4};
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

const PlaceWrapper = styled.div`
  margin: 1rem;
  padding: 1rem;
`;

const AddButton = styled.button`
  width: 40%;
  border-radius: 3rem;

  padding: 0.5rem 2rem;

  background-color: ${({ theme }) => theme.colors.Gray0};
  color: ${({ theme }) => theme.colors.White};
  ${({ theme }) => theme.fonts.Body4};
`;

const CardContainer = styled.div`
  background-color: #fff;
  display: flex;
  flex-direction: column;

  width: 100%;
  overflow: hidden;

  cursor: pointer;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 22rem;
  overflow: hidden;
  border-radius: 10px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TextContainer = styled.div`
  box-sizing: border-box;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  text-align: left;

  width: 100%;
`;

const Title = styled.h3`
  width: 100%;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ theme }) => theme.fonts.Title6};
  color: ${({ theme }) => theme.colors.Gray0};
`;
