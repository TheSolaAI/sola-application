'use client';
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import useThemeManager, { Theme } from '@/store/ThemeManager';
import { toast } from 'sonner';
import { useSettingsHandler } from '@/store/SettingsHandler';
import ThemeSelector from './ThemeSelector';

interface ThemeSettingsProps {}

export interface ThemeSettingsRef {
  onSubmit: () => void;
}

export const ThemeSettings = forwardRef<ThemeSettingsRef, ThemeSettingsProps>(
  (_, ref) => {
    /**
     * Global State
     */
    const {
      theme,
      availableThemes,
      setTheme,
      addCustomTheme,
      getCustomThemes,
      deleteCustomTheme,
    } = useThemeManager();
    const { updateSettings } = useSettingsHandler();

    /**
     * Local State
     */
    const [isCreatingTheme, setIsCreatingTheme] = useState(false);
    const [isEditingTheme, setIsEditingTheme] = useState(false);
    const [activeTheme, setActiveTheme] = useState<Theme>(theme);
    const [originalTheme, setOriginalTheme] = useState<Theme>(theme);
    const [customThemes, setCustomThemes] = useState<Theme[]>([]);

    // Update local state when theme changes elsewhere in the app
    useEffect(() => {
      setActiveTheme(theme);
      setCustomThemes(getCustomThemes());
    }, [availableThemes]);

    // Initialize a new theme with the current theme settings
    const initNewThemeFromCurrent = () => {
      setActiveTheme({
        ...theme,
        name: `Custom${Object.keys(availableThemes).length + 1}`,
      });
      setIsCreatingTheme(true);
      setIsEditingTheme(false);
    };

    // Handle switching between themes
    const handleThemeChange = (themeName: string) => {
      setActiveTheme(availableThemes[themeName]);
      setTheme(availableThemes[themeName]);
      toast.success(`Theme changed to ${themeName}`);
    };

    // Handle creating a new theme
    const handleCreateTheme = () => {
      addCustomTheme(activeTheme);
      setTheme(activeTheme);
      updateSettings('custom_themes');
      setIsCreatingTheme(false);
      setCustomThemes(getCustomThemes());
      toast.success(`New theme "${activeTheme.name}" created`);
    };

    // Handle editing an existing custom theme
    const handleEditTheme = (theme: Theme) => {
      setActiveTheme(theme);
      setOriginalTheme(theme);
      setIsEditingTheme(true);
      setIsCreatingTheme(false);
    };

    // Save edited theme changes
    const handleSaveEditedTheme = () => {
      // First remove the original theme if name changed
      if (originalTheme.name !== activeTheme.name) {
        deleteCustomTheme(originalTheme);
      }

      // Add the updated theme
      addCustomTheme(activeTheme);
      setTheme(activeTheme);
      setIsEditingTheme(false);
      setCustomThemes(getCustomThemes());
      toast.success(`Theme "${activeTheme.name}" updated`);
    };

    // Handle deleting a custom theme
    const handleDeleteTheme = (theme: Theme) => {
      // Don't delete if it's the active theme
      if (theme.name === activeTheme.name) {
        toast.error("Can't delete the currently active theme");
        return;
      }

      deleteCustomTheme(theme);
      updateSettings('custom_themes');
      setCustomThemes(getCustomThemes());
      toast.success(`Theme "${theme.name}" deleted`);
    };

    // Cancel theme creation/editing
    const handleCancelThemeEdit = () => {
      setIsCreatingTheme(false);
      setIsEditingTheme(false);
      setActiveTheme(theme);
    };

    // Export the current theme to a JSON file
    const exportTheme = () => {
      const themeData = JSON.stringify(activeTheme, null, 2);
      const blob = new Blob([themeData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeTheme.name.replace(/\s+/g, '-').toLowerCase()}-theme.json`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Theme "${activeTheme.name}" exported successfully`);
    };

    // Import a theme JSON file
    const importTheme = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const themeData = JSON.parse(e.target?.result as string);

          // Check for all required theme properties
          const requiredProps = [
            'name',
            'baseTheme',
            'primary',
            'primaryDark',
            'baseBackground',
            'background',
            'sec_background',
            'backgroundContrast',
            'textColor',
            'secText',
            'border',
          ];

          const missingProps = requiredProps.filter((prop) => !themeData[prop]);

          if (missingProps.length === 0) {
            addCustomTheme(themeData);
            setCustomThemes(getCustomThemes());
            updateSettings('custom_themes');
            toast.success(`Theme "${themeData.name}" imported successfully`);
          } else {
            toast.error(
              `Invalid theme file: missing ${missingProps.join(', ')}`
            );
          }
        } catch (error) {
          toast.error('Invalid theme file format');
        }
      };
      reader.readAsText(file);
    };

    // Handle form submission
    const handleSubmit = () => {
      setTheme(activeTheme);
      toast.success('Theme settings updated');
    };

    useImperativeHandle(ref, () => ({
      onSubmit: handleSubmit,
    }));

    // Render color input field
    const renderColorField = (label: string, property: keyof Theme) => (
      <div>
        <label className="block text-sm font-medium text-textColor mb-1">
          {label}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            className="h-10 w-10 border border-border rounded"
            value={activeTheme[property] as string}
            onChange={(e) =>
              setActiveTheme({
                ...activeTheme,
                [property]: e.target.value,
              })
            }
          />
          <input
            type="text"
            className="border border-border rounded-md p-2 bg-sec_background w-full text-textColor"
            value={activeTheme[property] as string}
            onChange={(e) =>
              setActiveTheme({
                ...activeTheme,
                [property]: e.target.value,
              })
            }
          />
        </div>
      </div>
    );

    return (
      <div className="flex flex-col items-start justify-center gap-y-8">
        {/* Theme Preview */}
        <div className="w-full p-4 hidden md:flex md:flex-col items-center overflow-x-auto">
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

              {/* Right sidebar */}
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
          <ThemeSelector
            activeTheme={activeTheme}
            availableThemes={availableThemes}
            customThemes={customThemes}
            handleDeleteTheme={handleDeleteTheme}
            handleEditTheme={handleEditTheme}
            handleThemeChange={handleThemeChange}
            initNewThemeFromCurrent={initNewThemeFromCurrent}
          />
        </div>

        {/* Create/Edit Theme Form */}
        {(isCreatingTheme || isEditingTheme) && (
          <div className="w-full border border-border rounded-lg p-4">
            <h1 className="font-semibold text-textColor">
              {isCreatingTheme ? 'Create New Theme' : 'Edit Theme'}
            </h1>
            <p className="font-regular text-secText mb-4">
              Customize colors to{' '}
              {isCreatingTheme ? 'create your own theme' : 'update this theme'}
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

              {/* Color fields using the helper function */}
              {renderColorField('Primary Color', 'primary')}
              {renderColorField('Primary Dark', 'primaryDark')}
              {renderColorField('Base Background', 'baseBackground')}
              {renderColorField('Background', 'background')}
              {renderColorField('Secondary Background', 'sec_background')}
              {renderColorField('Background Contrast', 'backgroundContrast')}
              {renderColorField('Text Color', 'textColor')}
              {renderColorField('Secondary Text', 'secText')}
              {renderColorField('Border Color', 'border')}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 border border-border rounded-md text-secText hover:bg-backgroundContrast"
                onClick={handleCancelThemeEdit}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark"
                onClick={
                  isCreatingTheme ? handleCreateTheme : handleSaveEditedTheme
                }
              >
                {isCreatingTheme ? 'Create Theme' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Export/Import Themes */}
        <div className="w-full">
          <h1 className="font-semibold text-textColor">Import/Export</h1>
          <p className="font-regular text-secText mb-3">
            Share your themes with others or import themes
          </p>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 border border-border rounded-md text-textColor hover:bg-backgroundContrast"
              onClick={exportTheme}
            >
              Export Current Theme
            </button>
            <button
              className="px-4 py-2 border border-border rounded-md text-textColor hover:bg-backgroundContrast"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    importTheme(file);
                  }
                };
                input.click();
              }}
            >
              Import Theme
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ThemeSettings.displayName = 'ThemeSettings';
