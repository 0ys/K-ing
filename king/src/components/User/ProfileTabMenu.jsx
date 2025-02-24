import React from 'react';
import styled from 'styled-components';

import { IcPosts, IcPostsWhite } from '../../assets/icons';
import { IcArchiveBox, IcArchiveBoxWhite } from '../../assets/icons';

const ProfileTabMenu = ({ activeTab, onTabChange }) => {
  const handleScrollUp = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    handleScrollUp();
  };

  return (
    <St.TabMenu>
      {[
        {
          id: 'posts',
          label: 'Posts',
          activeIcon: <IcPosts />,
          inactiveIcon: <IcPostsWhite />,
        },
        {
          id: 'curations',
          label: 'Curations',
          activeIcon: <IcArchiveBox />,
          inactiveIcon: <IcArchiveBoxWhite />,
        },
      ].map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <St.TabButton key={tab.id} $isActive={isActive} onClick={() => handleTabClick(tab.id)}>
            <St.IconWrapper>{isActive ? tab.activeIcon : tab.inactiveIcon}</St.IconWrapper>
            <St.Label $isActive={isActive}>{tab.label}</St.Label>
          </St.TabButton>
        );
      })}
      <St.Slider activeIndex={activeTab === 'curations' ? 1 : 0} />
    </St.TabMenu>
  );
};

export default ProfileTabMenu;

const St = {
  TabMenu: styled.nav`
    position: relative;
    display: flex;
    justify-content: space-between;
    border-bottom: 0.2rem solid ${({ theme }) => theme.colors.Gray2};
  `,
  TabButton: styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'isActive',
  })`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0;
    border: none;
    background: none;
    cursor: pointer;
    text-align: center;

    font-weight: ${({ $isActive }) => ($isActive ? 'bold' : 'normal')};
    color: ${({ theme, $isActive }) => ($isActive ? theme.colors.Gray0 : theme.colors.Gray3)};
  `,
  IconWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.4rem;
    svg {
      width: 2rem;
      height: 2rem;
    }
  `,
  Label: styled.span`
    ${({ theme }) => theme.fonts.Body3};
    font-weight: ${({ $isActive }) => ($isActive ? 'bold' : 'normal')};
  `,
  Slider: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'activeIndex',
  })`
    position: absolute;
    bottom: 0;
    height: 0.3rem;
    width: 50%;
    background-color: ${({ theme }) => theme.colors.Gray0};
    transition: transform 0.3s ease;
    transform: translateX(${({ activeIndex }) => activeIndex * 100}%) translateY(50%);
    border-radius: 10rem;
    z-index: 2;
  `,
};
