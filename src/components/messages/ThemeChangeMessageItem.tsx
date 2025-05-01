'use client';
import { FC, useEffect } from 'react';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useLayoutContext } from '@/providers/LayoutProvider';

interface ThemeChangeMessageItemProps {
  props: {
    themeName: string;
    autoSwitched: boolean;
  };
}

export const ThemeChangeMessageItem: FC<ThemeChangeMessageItemProps> = ({
  props,
}) => {
  /**
   * Global State
   */
  const { setSettingsIsOpen } = useLayoutContext();

  /**
   * Effects
   */
  useEffect(() => {
    if (props.autoSwitched) {
      console.log('changing theme please');
    }
  }, [props.autoSwitched]);

  /**
   * Render
   */
  const getThemeIcon = () => {
    if (props.themeName === 'dark') {
      return <FaMoon className="h-5 w-5 text-textColor" />;
    } else {
      return <FaSun className="h-5 w-5 text-textColor" />;
    }
  };

  const footer = (
    <div className="text-xs text-secText">
      <p>
        {props.autoSwitched
          ? 'Theme was automatically changed based on your system preferences.'
          : 'Click the button to change the theme manually.'}
      </p>
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title="Theme Settings"
      subtitle={`Current theme: ${props.themeName}`}
      footer={footer}
    >
      <div className="flex items-center gap-4 p-3">
        <div className="flex items-center gap-2">
          {getThemeIcon()}
          <span className="text-textColor font-medium capitalize">
            {props.themeName} Mode
          </span>
        </div>

        {!props.autoSwitched && (
          <button
            onClick={() => setSettingsIsOpen(true)}
            className="ml-auto bg-surface hover:bg-surfaceHover text-textColor px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            {props.themeName === 'dark' ? (
              <FaSun className="h-4 w-4" />
            ) : (
              <FaMoon className="h-4 w-4" />
            )}
            Switch to {props.themeName === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        )}
      </div>
    </BaseBorderedMessageItem>
  );
};
