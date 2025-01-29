import { useEffect, useState } from 'react';
import { ChevronDown } from 'react-feather';
import useAppState from '../models/AppState.ts';
import { AIVOICE, AIEMOTION } from '../config/ai/aiConfig';
import useUser from '../hooks/useUser';
import { AiEmotion, AiVoice } from '../types/database/aiConfig';
import { usePrivy } from '@privy-io/react-auth';

const Settings: React.FC = () => {
  const { aiVoice, aiEmotion, setAccessToken } = useAppState();
  const { updateSettings } = useUser();
  const { getAccessToken } = usePrivy();

  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isEmotionOpen, setIsEmotionOpen] = useState<boolean>(false);

  const toggleVoiceDropdown = () => setIsVoiceOpen((prev) => !prev);
  const toggleEmotionDropdown = () => setIsEmotionOpen((prev) => !prev);

  const handleVoiceSelection = (voice: AiVoice) => {
    updateSettings({ voice_preference: voice });
    setIsVoiceOpen(false);
  };

  const handleEmotionSelection = (emotion: AiEmotion) => {
    updateSettings({ emotion_choice: emotion });
    setIsEmotionOpen(false);
  };

  useEffect(() => {
    const fetchAccessToken = async () => {
      const token = await getAccessToken();
      setAccessToken(token);
    };

    fetchAccessToken();
  }, []);

  return (
    <div className="bg-white h-screen p-4 dark:bg-darkalign animate-in fade-in-0 duration-300">
      <div className="bg-graydark rounded-lg p-4 dark:bg-darkalign2">
        <h1 className="font-bold text-xl dark:text-purple-300">
          APP CONFIGURATION:
        </h1>
        <div className="flex flex-col gap-6 p-4 m-4">
          {/* AI Voice Configuration */}
          <div>
            <span className="text-boxdark font-medium dark:text-bodydark2">
              AI Voice :
            </span>
            <div className="relative inline-block text-left m-2">
              <button
                onClick={toggleVoiceDropdown}
                className="inline-flex justify-between w-full rounded-md shadow-sm px-4 py-2 bg-white text-sm font-medium text-boxdark-2 dark:bg-bodydark2 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-boxdark focus:ring-offset-2 focus:ring-offset-gray-100"
              >
                {aiVoice}
                <ChevronDown
                  className={`h-5 w-5 transform transition-transform duration-200 ${
                    isVoiceOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
              {isVoiceOpen && (
                <div
                  className="absolute z-10 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-bodydark2"
                  role="menu"
                >
                  <div className="py-1">
                    {AIVOICE.map((voice) => (
                      <button
                        key={voice}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-bodydark"
                        onClick={() => handleVoiceSelection(voice as AiVoice)}
                      >
                        {voice}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Emotion Configuration */}
          <div>
            <span className="text-boxdark font-medium dark:text-bodydark2">
              AI Emotion :
            </span>
            <div className="relative inline-block text-left mx-2">
              <button
                onClick={toggleEmotionDropdown}
                className="inline-flex justify-between w-full rounded-md shadow-sm px-4 py-2 bg-white text-sm font-medium text-boxdark-2 dark:bg-bodydark2 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-boxdark focus:ring-offset-2 focus:ring-offset-gray-100"
              >
                {aiEmotion}
                <ChevronDown
                  className={`h-5 w-5 transform transition-transform duration-200 ${
                    isEmotionOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
              {isEmotionOpen && (
                <div
                  className="absolute z-10 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-bodydark2"
                  role="menu"
                >
                  <div className="py-1">
                    {AIEMOTION.map((emotion) => (
                      <button
                        key={emotion}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-bodydark"
                        onClick={() =>
                          handleEmotionSelection(emotion as AiEmotion)
                        }
                      >
                        {emotion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
