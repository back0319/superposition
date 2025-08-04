import React, { createContext, useState, useContext, ReactNode } from 'react';

// 슬라이드 메뉴 데이터 타입 정의
export type MenuItemType = {
  title: string;
  details: string[];
};

type SlideMenuContextType = {
  activeMenuId: string;
  setActiveMenuId: (id: string) => void;
  currentMenu: MenuItemType[];
  setCurrentMenu: (menu: MenuItemType[]) => void;
  currentTitle: string;
  setCurrentTitle: (title: string) => void;
  detailIdx: number;
  setDetailIdx: (idx: number) => void;
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
  sectionPositions: number[];
  setSectionPositions: (positions: number[]) => void;
};

// Context 생성
const SlideMenuContext = createContext<SlideMenuContextType | undefined>(undefined);

// Context Provider 컴포넌트
export const SlideMenuProvider = ({ children }: { children: ReactNode }) => {
  const [activeMenuId, setActiveMenuId] = useState<string>('');
  const [currentMenu, setCurrentMenu] = useState<MenuItemType[]>([]);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [detailIdx, setDetailIdx] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [sectionPositions, setSectionPositions] = useState<number[]>([]);

  return (
    <SlideMenuContext.Provider
      value={{
        activeMenuId,
        setActiveMenuId,
        currentMenu,
        setCurrentMenu,
        currentTitle,
        setCurrentTitle,
        detailIdx,
        setDetailIdx,
        scrollProgress,
        setScrollProgress,
        sectionPositions,
        setSectionPositions
      }}
    >
      {children}
    </SlideMenuContext.Provider>
  );
};

// Context 사용을 위한 Custom Hook
export const useSlideMenu = () => {
  const context = useContext(SlideMenuContext);
  if (context === undefined) {
    throw new Error('useSlideMenu must be used within a SlideMenuProvider');
  }
  return context;
};
