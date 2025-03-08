// components/custom-tabs.tsx

"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";

interface Tab {
  label: React.ReactNode;
  content: React.ReactNode;
}

interface TabItemProps {
  label: React.ReactNode;
  isActive: boolean;
  index: number;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  elementRef: React.Ref<HTMLDivElement>;
}

interface CustomTabsProps {
  tabs: Tab[];
  defaultActiveIndex?: number;
  className?: string;
  onTabChange?: (index: number) => void;
}

// Memoized TabItem component to prevent unnecessary re-renders
const TabItem = memo(
  ({
    label,
    isActive,
    onClick,
    onMouseEnter,
    onMouseLeave,
    elementRef,
  }: TabItemProps) => (
    <div
      ref={elementRef}
      className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
        isActive
          ? "text-[#0e0e10] dark:text-white"
          : "text-[#0e0f1199] dark:text-[#ffffff99]"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div className="text-sm leading-5 whitespace-nowrap flex items-center justify-center h-full">
        {label}
      </div>
    </div>
  ),
);
TabItem.displayName = "TabItem";

// Main CustomTabs component
const CustomTabs: React.FC<CustomTabsProps> = ({
  tabs,
  defaultActiveIndex = 0,
  className = "",
  onTabChange,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [hoverStyle, setHoverStyle] = useState<React.CSSProperties>({});
  const [activeStyle, setActiveStyle] = useState<React.CSSProperties>({
    left: "0px",
    width: "0px",
  });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Ensure tabRefs array has correct length
  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
    while (tabRefs.current.length < tabs.length) {
      tabRefs.current.push(null);
    }
  }, [tabs.length]);

  // Handle tab click with useCallback
  const handleTabClick = useCallback(
    (index: number) => {
      setActiveIndex(index);
      // Call the onTabChange callback if provided
      if (onTabChange) {
        onTabChange(index);
      }
    },
    [onTabChange],
  );

  // Handle mouse events with useCallback
  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  // Update hover effect based on hovered index
  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  // Update active indicator when active tab changes
  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeIndex]);

  // Update active indicator on mount and window resize
  useEffect(() => {
    const updateActiveStyle = () => {
      requestAnimationFrame(() => {
        const activeElement = tabRefs.current[activeIndex];
        if (activeElement) {
          const { offsetLeft, offsetWidth } = activeElement;
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          });
        }
      });
    };

    // Update initially
    updateActiveStyle();

    // Update on window resize
    window.addEventListener("resize", updateActiveStyle);
    return () => {
      window.removeEventListener("resize", updateActiveStyle);
    };
  }, [activeIndex]);

  // Create setRef callback for individual tabs
  const setTabRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      tabRefs.current[index] = el;
    },
    [],
  );

  // Get the active tab content
  const activeContent = tabs[activeIndex]?.content;

  return (
    <div className={className}>
      <div className="relative">
        {/* Hover highlight - absolute positioned element */}
        <div
          className="absolute h-[30px] transition-all duration-300 ease-out bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[6px] hardware-accelerated"
          style={{
            ...hoverStyle,
            opacity: hoveredIndex !== null ? 1 : 0,
            transform: "translateZ(0)", // Hardware acceleration
            willChange: "left, width", // Hint for browser optimization
          }}
        />

        {/* Active indicator - absolute positioned green line */}
        <div
          className="absolute bottom-[-6px] h-[2px] bg-emerald-600 transition-all duration-300 ease-out hardware-accelerated"
          style={{
            ...activeStyle,
            transform: "translateZ(0)", // Hardware acceleration
            willChange: "left, width", // Hint for browser optimization
          }}
        />

        {/* Tabs container */}
        <div className="relative flex space-x-[6px] items-center">
          {tabs.map((tab, index) => (
            <TabItem
              key={index}
              elementRef={setTabRef(index)}
              label={tab.label}
              isActive={index === activeIndex}
              index={index}
              onClick={() => handleTabClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </div>
      </div>

      {/* Render only the active content for better performance */}
      <div className="mt-4 contain-layout">{activeContent}</div>
    </div>
  );
};

export default memo(CustomTabs);
