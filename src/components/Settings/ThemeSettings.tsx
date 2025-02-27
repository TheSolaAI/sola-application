import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import useThemeManager, { Theme } from '../../models/ThemeManager';
import { toast } from 'sonner';
import { useSettingsHandler } from '../../models/SettingsHandler';
interface ThemeSettingsProps {}

export interface ThemeSettingsRef {
  onSubmit: () => void;
}

export const ThemeSettings = forwardRef<ThemeSettingsRef, ThemeSettingsProps>(
  (_, ref) => {
    /**
     * Global State
     */
    const { theme, availableThemes, setTheme, addCustomTheme } =
      useThemeManager();
    const { updateSettings } = useSettingsHandler();

    /**
     * Local State
     */
    const [isCreatingTheme, setIsCreatingTheme] = useState<boolean>(false);
    const [activeTheme, setActiveTheme] = useState<Theme>(theme);

    /**
     * If the theme changes anywhere else in the application we update the active theme
     */
    useEffect(() => {
      setActiveTheme(theme);
    }, [theme]);

    /**
     * Initialize a new theme with the current theme settings
     */
    const initNewThemeFromCurrent = () => {
      setActiveTheme({
        ...theme,
        name: `Custom${Object.keys(availableThemes).length + 1}`,
      });
      setIsCreatingTheme(true);
    };

    const handleThemeChange = (themeName: string) => {
      setActiveTheme(availableThemes[themeName]);
      setTheme(availableThemes[themeName]);
      toast.success(`Theme changed to ${themeName}`);
    };

    const handleCreateTheme = () => {
      toast.success(`New theme "${activeTheme.name}" created (demo only)`);
      addCustomTheme(activeTheme);
      setTheme(activeTheme);
      updateSettings('custom_themes');
      setIsCreatingTheme(false);
    };

    const handleSubmit = () => {
      // This function could be used to save all theme settings
      return;
    };

    useImperativeHandle(ref, () => ({
      onSubmit: handleSubmit,
    }));

    return (
      <div className="flex flex-col items-start justify-center gap-y-8">
        {/* Theme Preview */}
        <div className="w-full p-4 flex flex-col items-center">
          <h1 className="font-semibold text-textColor mb-4">Theme Preview</h1>
          <div
            className="w-full max-w-3xl h-64 rounded-lg border border-border overflow-hidden"
            style={{ backgroundColor: activeTheme.background }}
          >
            {/* App Layout */}
            <div
              className="flex h-full p-1"
              style={{
                backgroundColor: activeTheme.baseBackground,
              }}
            >
              {/* Left sidebar */}
              <div
                className="w-[15%] h-full mr-1 rounded-md"
                style={{
                  backgroundColor: activeTheme.sec_background,
                }}
              >
                <div className="p-2">
                  <h1 className="text-textColor font-medium text-xs">
                    Sola AI
                  </h1>
                  {/* Create new Chat Button */}
                  <div
                    style={{
                      borderRadius: '0.25rem',
                      background: `linear-gradient(to right, ${activeTheme.primary}, ${activeTheme.primaryDark})`,
                      padding: '1px',
                      transition: 'all 300ms',
                      boxShadow: `0 0 0 0 ${activeTheme.primaryDark}`,
                      marginTop: '0.5rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 10px 2px ${activeTheme.primaryDark}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 0 ${activeTheme.primaryDark}`;
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: '100%',
                        borderRadius: '0.25rem',
                        backgroundColor: activeTheme.background,
                        padding: '0.35rem',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Main chat area */}
              <div
                className="w-[60%] h-full flex flex-col rounded-md"
                style={{ backgroundColor: activeTheme.background }}
              >
                <div className="flex-grow p-2">
                  {/* Chat messages */}
                  <div className="mb-2 ml-6 p-2 max-w-[70%]">
                    <div
                      className="w-full h-3 rounded"
                      style={{ backgroundColor: activeTheme.textColor }}
                    ></div>
                    <div
                      className="w-2/3 h-3 rounded mt-1"
                      style={{ backgroundColor: activeTheme.textColor }}
                    ></div>
                  </div>
                  <div
                    className="mb-2 mr-6 ml-auto p-2 rounded-lg max-w-[30%] flex"
                    style={{ backgroundColor: activeTheme.sec_background }}
                  >
                    <div
                      className="w-full h-3 rounded"
                      style={{ backgroundColor: activeTheme.secText }}
                    ></div>
                  </div>
                </div>
                {/* Input area */}
                <div className="p-2 flex flex-row px-20 gap-x-2">
                  <div
                    className="w-full h-6 rounded-full"
                    style={{ backgroundColor: activeTheme.sec_background }}
                  ></div>
                  <div
                    className="rounded-full h-6 w-6 aspect-square"
                    style={{
                      backgroundColor: activeTheme.primary,
                    }}
                  />
                </div>
              </div>

              {/* Right sidebar - Wallet Lens */}
              <div
                className="w-[25%] h-full ml-1 rounded-md overflow-hidden"
                style={{
                  backgroundColor: activeTheme.sec_background,
                }}
              >
                <div className="p-2 flex flex-col h-full">
                  {/* Wallet header */}
                  <div
                    className="flex items-center gap-2 mb-2 p-2 rounded-md"
                    style={{ backgroundColor: activeTheme.baseBackground }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: activeTheme.primary }}
                    ></div>
                    <div className="flex-1">
                      <div
                        className="w-full h-3 mb-1 rounded"
                        style={{ backgroundColor: activeTheme.textColor }}
                      ></div>
                      <div
                        className="w-3/4 h-2 rounded"
                        style={{ backgroundColor: activeTheme.secText }}
                      ></div>
                    </div>
                  </div>
                  {/* Content */}
                  <div
                    className="flex flex-1 flex-col gap-y-1 p-1 rounded-lg"
                    style={{ backgroundColor: activeTheme.baseBackground }}
                  >
                    <div
                      className="w-full h-[80%] rounded-lg relative overflow-hidden"
                      style={{ backgroundColor: activeTheme.sec_background }}
                    >
                      {/* Pie Chart Mockup */}
                      <div className="absolute w-full h-full flex items-center justify-center p-2">
                        <div className="relative w-full rounded-full bg-gray-300 aspect-square">
                          <div className="absolute top-0 left-1/2 w-1/2 h-1/2 bg-blue-500 rounded-tr-full"></div>
                          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-green-500 rounded-bl-full"></div>
                          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500 rounded-tl-full"></div>
                          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-yellow-500 rounded-br-full"></div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="w-full h-[20%] rounded-lg"
                      style={{ backgroundColor: activeTheme.sec_background }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="w-full">
          <h1 className="font-semibold text-textColor">Select Theme</h1>
          <p className="font-regular text-secText">
            Choose from available themes or create your own
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
            {Object.entries(availableThemes).map(([name, themeObj]) => (
              <div
                key={name}
                className={`p-3 rounded-md cursor-pointer transition-all ${
                  activeTheme.name === name
                    ? 'ring-2 ring-primary'
                    : 'border border-border hover:scale-105'
                }`}
                onClick={() => handleThemeChange(name)}
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
            ))}

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
          </div>
        </div>

        {/* Create New Theme Form */}
        {isCreatingTheme && (
          <div className="w-full border border-border rounded-lg p-4">
            <h1 className="font-semibold text-textColor">Create New Theme</h1>
            <p className="font-regular text-secText mb-4">
              Customize colors to create your own theme
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Theme Name */}
              <div>
                <label className="block text-sm font-medium text-textColor mb-1">
                  Theme Name
                </label>
                <input
                  type="text"
                  className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
                  value={activeTheme.name}
                  onChange={(e) =>
                    setActiveTheme({ ...activeTheme, name: e.target.value })
                  }
                  placeholder="My Custom Theme"
                />
              </div>

              {/* Base Theme */}
              <div>
                <label className="block text-sm font-medium text-textColor mb-1">
                  Base Theme
                </label>
                <select
                  className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
                  value={activeTheme.baseTheme}
                  onChange={(e) =>
                    setActiveTheme({
                      ...activeTheme,
                      baseTheme: e.target.value as 'light' | 'dark',
                    })
                  }
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              {/* Colors */}
              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-textColor mb-1">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-10 border border-border rounded"
                    value={activeTheme.primary}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        primary: e.target.value as `#${string}`,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
                    value={activeTheme.primary}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        primary: e.target.value as `#${string}`,
                      })
                    }
                  />
                </div>
              </div>

              {/* Primary Dark Color */}
              <div>
                <label className="block text-sm font-medium text-textColor mb-1">
                  Primary Dark
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-10 border border-border rounded"
                    value={activeTheme.primaryDark}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        primaryDark: e.target.value as `#${string}`,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
                    value={activeTheme.primaryDark}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        primaryDark: e.target.value as `#${string}`,
                      })
                    }
                  />
                </div>
              </div>

              {/* Base Background */}
              <div>
                <label className="block text-sm font-medium text-textColor mb-1">
                  Base Background
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-10 border border-border rounded"
                    value={activeTheme.baseBackground}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        baseBackground: e.target.value as `#${string}`,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
                    value={activeTheme.baseBackground}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        baseBackground: e.target.value as `#${string}`,
                      })
                    }
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-textColor mb-1">
                  Background
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-10 border border-border rounded"
                    value={activeTheme.background}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        background: e.target.value as `#${string}`,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
                    value={activeTheme.background}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        background: e.target.value as `#${string}`,
                      })
                    }
                  />
                </div>
              </div>

              {/* Secondary Background */}
              <div>
                <label className="block text-sm font-medium text-textColor mb-1">
                  Secondary Background
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-10 border border-border rounded"
                    value={activeTheme.sec_background}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        sec_background: e.target.value as `#${string}`,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
                    value={activeTheme.sec_background}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        sec_background: e.target.value as `#${string}`,
                      })
                    }
                  />
                </div>
              </div>

              {/* Background Contrast */}
              <div>
                <label className="block text-sm font-medium text-textColor mb-1">
                  Background Contrast
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-10 border border-border rounded"
                    value={activeTheme.backgroundContrast}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        backgroundContrast: e.target.value as `#${string}`,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
                    value={activeTheme.backgroundContrast}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        backgroundContrast: e.target.value as `#${string}`,
                      })
                    }
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-textColor mb-1">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-10 border border-border rounded"
                    value={activeTheme.textColor}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        textColor: e.target.value as `#${string}`,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
                    value={activeTheme.textColor}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        textColor: e.target.value as `#${string}`,
                      })
                    }
                  />
                </div>
              </div>

              {/* Secondary Text Color */}
              <div>
                <label className="block text-sm font-medium text-textColor mb-1">
                  Secondary Text
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-10 border border-border rounded"
                    value={activeTheme.secText}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        secText: e.target.value as `#${string}`,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
                    value={activeTheme.secText}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        secText: e.target.value as `#${string}`,
                      })
                    }
                  />
                </div>
              </div>

              {/* Border Color */}
              <div>
                <label className="block text-sm font-medium text-textColor mb-1">
                  Border Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-10 border border-border rounded"
                    value={activeTheme.border}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        border: e.target.value as `#${string}`,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
                    value={activeTheme.border}
                    onChange={(e) =>
                      setActiveTheme({
                        ...activeTheme,
                        border: e.target.value as `#${string}`,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 border border-border rounded-md text-secText hover:bg-backgroundContrast"
                onClick={() => setIsCreatingTheme(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark"
                onClick={handleCreateTheme}
              >
                Create Theme
              </button>
            </div>
          </div>
        )}

        {/* Theme and System Preferences
        <div className="w-full">
          <h1 className="font-semibold text-textColor">System Preferences</h1>
          <p className="font-regular text-secText mb-3">
            Manage how the application handles theme selection
          </p>

          <div className="bg-sec_background border border-border rounded-md p-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium text-textColor">Use System Theme</h2>
                <p className="text-sm text-secText">
                  Automatically switch between light and dark based on system
                  settings
                </p>
              </div>
              <button
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  activeTheme.name === 'system' ? 'bg-primary' : 'bg-secText/30'
                }`}
                onClick={() => handleThemeChange('system')}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    activeTheme.name === 'system' ? 'left-7' : 'left-1'
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div> */}

        {/* Export/Import Themes */}
        <div className="w-full">
          <h1 className="font-semibold text-textColor">Import/Export</h1>
          <p className="font-regular text-secText mb-3">
            Share your themes with others or import themes
          </p>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 border border-border rounded-md text-textColor hover:bg-backgroundContrast"
              onClick={() => {
                // Demo - in reality, would generate a JSON file
                navigator.clipboard.writeText(JSON.stringify(theme));
                toast.success('Theme copied to clipboard');
              }}
            >
              Export Current Theme
            </button>
            <button
              className="px-4 py-2 border border-border rounded-md text-textColor hover:bg-backgroundContrast"
              onClick={() => {
                toast.info('Theme import feature is a demo only');
              }}
            >
              Import Theme
            </button>
          </div>
        </div>
      </div>
    );
  },
);

ThemeSettings.displayName = 'ThemeSettings';

