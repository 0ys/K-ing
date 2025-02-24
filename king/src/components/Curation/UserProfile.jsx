import React from 'react';
import styled from 'styled-components';

const UserProfile = ({ name, date, profileImage, onClick }) => {
  return (
    <ProfileContainer>
      <ProfileImage src={profileImage} alt="Profile" onClick={onClick} />
      <ProfileInfo>
        <UserName onClick={onClick}>{name}</UserName>
        <Date>{date}</Date>
      </ProfileInfo>
    </ProfileContainer>
  );
};

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const ProfileImage = styled.img`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  max-width: 17rem;
  ${({ theme }) => theme.fonts.Title6};
  color: ${({ theme }) => theme.colors.Gray0};
  margin-bottom: 0.5rem;
  cursor: pointer;
`;

const Date = styled.span`
  ${({ theme }) => theme.fonts.Body5};
  color: ${({ theme }) => theme.colors.Gray1};
`;

export default UserProfile;
