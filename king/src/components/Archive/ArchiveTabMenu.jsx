import React from 'react';
import styled from 'styled-components';

import { IcArchiveBox, IcArchiveBoxWhite } from '../../assets/icons';
import { IcStar2, IcStarWhite } from '../../assets/icons';

const ArchiveTabMenu = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'Curations',
      label: 'Curations',
      activeIcon: <IcArchiveBox />,
      inactiveIcon: <IcArchiveBoxWhite />,
    },
    {
      id: 'Favorites',
      label: 'Favorites',
      activeIcon: <IcStar2 />,
      inactiveIcon: <IcStarWhite />,
    },
  ];

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <St.ArchiveTabMenuWrapper>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <St.TabButton key={tab.id} $isActive={isActive} onClick={() => onTabChange(tab.id)}>
            <St.IconWrapper>{isActive ? tab.activeIcon : tab.inactiveIcon}</St.IconWrapper>
            <St.Label $isActive={isActive}>{tab.label}</St.Label>
          </St.TabButton>
        );
      })}
      <St.Slider activeIndex={activeIndex} />
    </St.ArchiveTabMenuWrapper>
  );
};

export default ArchiveTabMenu;

const St = {
  ArchiveTabMenuWrapper: styled.nav`
    position: relative;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid ${({ theme }) => theme.colors.Gray2};
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

    /* ${({ theme }) => theme.fonts.Body1}; */

    /* 활성화 상태에 따른 스타일 */
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
    height: 0.2rem;
    width: 50%; /* 각 탭의 너비 */
    background-color: ${({ theme }) => theme.colors.Gray0};
    transition: transform 0.3s ease;
    transform: translateX(${({ activeIndex }) => activeIndex * 100}%) translateY(50%);
    border-radius: 10rem;
    z-index: 2;
  `,
};
