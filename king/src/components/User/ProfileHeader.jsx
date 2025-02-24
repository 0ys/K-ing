import styled from 'styled-components';

const ProfileHeader = ({ user }) => {
  return (
    <StProfileHeader>
      <St.ProfileMainInfoWrapper>
        <St.ProfileImage src={user.imageUrl} alt="프로필 이미지" />
        <St.ProfileInfo>
          <St.Nickname>{user.nickname}</St.Nickname>
          <St.Email>{user.email}</St.Email>
        </St.ProfileInfo>
      </St.ProfileMainInfoWrapper>

      <St.DescriptionWrapper>
        <St.Description>{user.description || ''}</St.Description>
      </St.DescriptionWrapper>
    </StProfileHeader>
  );
};

export default ProfileHeader;

const StProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0rem 0;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  margin-top: 1.5rem;
`;

const St = {
  ProfileMainInfoWrapper: styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
  `,
  ProfileImage: styled.img`
    width: 6rem;
    height: 6rem;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1.5rem;
    border: 0.1rem solid;
    border-color: ${({ theme }) => theme.colors.Gray3};
  `,

  ProfileInfo: styled.div`
    display: flex;
    flex-direction: column;
    width: 70%;
  `,

  Nickname: styled.h2`
    ${({ theme }) => theme.fonts.Title5}
  `,

  Email: styled.p`
    padding: 0.5rem 0;
    ${({ theme }) => theme.fonts.Body4};
    color: ${({ theme }) => theme.colors.Gray2};
  `,

  DescriptionWrapper: styled.div`
    max-width: 100%;
  `,

  Description: styled.p`
    ${({ theme }) => theme.fonts.Body5};
    color: ${({ theme }) => theme.colors.Gray1};
    word-break: break-word; /* 줄바꿈 처리 */
  `,

  SettingsButton: styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
  `,
};
