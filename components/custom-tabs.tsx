// custom-tabs.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";

interface Tab {
  label: React.ReactNode;
  content: React.ReactNode;
}

interface CustomTabsProps {
  tabs: Tab[];
  defaultActiveIndex?: number;
  className?: string;
  onTabChange?: (index: number) => void; // <-- Added onTabChange prop
}

const CustomTabs: React.FC<CustomTabsProps> = ({
  tabs,
  defaultActiveIndex = 0,
  className = "",
  onTabChange, // <-- Destructure it
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [hoverStyle, setHoverStyle] = useState<React.CSSProperties>({});
  const [activeStyle, setActiveStyle] = useState<React.CSSProperties>({
    left: "0px",
    width: "0px",
  });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Ensure the activeStyle is set on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      const initialElement = tabRefs.current[activeIndex];
      if (initialElement) {
        const { offsetLeft, offsetWidth } = initialElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    });
  }, []);

  return (
    <div className={className}>
      <div className="relative">
        {/* Hover Highlight */}
        <div
          className="absolute h-[30px] transition-all duration-300 ease-out bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[6px]"
          style={{
            ...hoverStyle,
            opacity: hoveredIndex !== null ? 1 : 0,
          }}
        />
        {/* Active Indicator using emerald-600 (green) */}
        <div
          className="absolute bottom-[-6px] h-[2px] bg-emerald-600 transition-all duration-300 ease-out"
          style={activeStyle}
        />
        <div className="relative flex space-x-[6px] items-center">
          {tabs.map((tab, index) => (
            <div
              key={index}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                index === activeIndex
                  ? "text-[#0e0e10] dark:text-white"
                  : "text-[#0e0f1199] dark:text-[#ffffff99]"
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                setActiveIndex(index);
                // Call the onTabChange callback if provided
                if (onTabChange) {
                  onTabChange(index);
                }
              }}
            >
              <div className="text-sm leading-5 whitespace-nowrap flex items-center justify-center h-full">
                {tab.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Render the content for the active tab */}
      <div className="mt-4">{tabs[activeIndex].content}</div>
    </div>
  );
};

export default CustomTabs;
