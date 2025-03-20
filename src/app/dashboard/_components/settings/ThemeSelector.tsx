'use client';
import { useState, useEffect, useRef, FC } from 'react';
import { Theme } from '@/store/ThemeManager';
import { LuTrash } from 'react-icons/lu';
import { CiEdit } from 'react-icons/ci';

interface ThemeSelectorProps {
  availableThemes: Record<string, Theme>;
  customThemes: Theme[];
  activeTheme: Theme;
  handleThemeChange: (name: string) => void;
  handleEditTheme: (themeObj: any) => void;
  handleDeleteTheme: (themeObj: any) => void;
  initNewThemeFromCurrent: () => void;
}

const ThemeSelector: FC<ThemeSelectorProps> = ({
  availableThemes,
  customThemes,
  activeTheme,
  handleThemeChange,
  handleEditTheme,
  handleDeleteTheme,
  initNewThemeFromCurrent,
}) => {
  /**
   * Local state
   */
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    themeObj: Theme | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    themeObj: null,
  });

  /**
   * Refs
   */
  const contextMenuRef = useRef(null);

  // Handle right-click on theme card
  const handleContextMenu = (e, themeObj: Theme) => {
    // Only show context menu for custom themes
    const isCustomTheme = customThemes.some((ct) => ct.name === themeObj.name);
    if (!isCustomTheme) return;

    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      themeObj,
    });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      themeObj: null,
    });
  };

  // Handle click outside context menu
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        closeContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.visible]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 p-1">
      {Object.entries(availableThemes).map(([name, themeObj]) => {
        // Check if this is a custom theme
        const isCustomTheme = customThemes.some((ct) => ct.name === name);
        return (
          <div
            key={name}
            className={`p-3 rounded-md transition-all relative ${
              activeTheme.name === name
                ? 'border-2 border-primary'
                : 'border border-border hover:scale-105'
            }`}
            onClick={() => handleThemeChange(name)}
            onContextMenu={(e) => handleContextMenu(e, themeObj)}
          >
            <div className="flex items-center gap-x-2 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: themeObj.primary }}
              ></div>
              <span className="font-medium text-textColor">{name}</span>
            </div>
            <div className="flex gap-1 h-6">
              <div
                className="w-1/4 rounded"
                style={{ backgroundColor: themeObj.background }}
              ></div>
              <div
                className="w-1/4 rounded"
                style={{ backgroundColor: themeObj.sec_background }}
              ></div>
              <div
                className="w-1/4 rounded"
                style={{ backgroundColor: themeObj.baseBackground }}
              ></div>
              <div
                className="w-1/4 rounded"
                style={{ backgroundColor: themeObj.primary }}
              ></div>
            </div>
          </div>
        );
      })}

      {/* Create new theme button */}
      <div
        className="p-3 rounded-md cursor-pointer border border-dashed border-border hover:border-primary flex flex-col items-center justify-center"
        onClick={initNewThemeFromCurrent}
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
          +
        </div>
        <span className="text-sm text-secText">Create Custom Theme</span>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed bg-background shadow-lg rounded-md overflow-hidden border border-border z-50"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <ul className="py-1">
            <li
              className="px-4 py-2 hover:bg-sec_background cursor-pointer flex items-center gap-2"
              onClick={() => {
                handleEditTheme(contextMenu.themeObj);
                closeContextMenu();
              }}
            >
              <CiEdit className="text-textColor" size={16} />
              <span className="text-textColor">Edit Theme</span>
            </li>
            <li
              className="px-4 py-2 hover:bg-sec_background cursor-pointer flex items-center gap-2"
              onClick={() => {
                handleDeleteTheme(contextMenu.themeObj);
                closeContextMenu();
              }}
            >
              <LuTrash className="text-textColor" size={16} />
              <span className="text-textColor">Delete Theme</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
