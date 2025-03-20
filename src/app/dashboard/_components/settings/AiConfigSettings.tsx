'use client';
import { ChangeEvent, useState, forwardRef, useImperativeHandle } from 'react';
import { AI_VOICES } from '@/config/ai';
import { useSessionHandler } from '@/store/SessionHandler';
import { toast } from 'sonner';
import { useSettingsHandler } from '@/store/SettingsHandler';

interface AIConfigSettingsProps {}

export interface AIConfigSettingsRef {
  onSubmit: () => void;
}

export const AIConfigSettings = forwardRef<
  AIConfigSettingsRef,
  AIConfigSettingsProps
>((_, ref) => {
  /**
   * Global State
   */
  const { aiEmotion, aiVoice, setAiEmotion, setAiVoice, updateSession } =
    useSessionHandler();

  const { updateSettings } = useSettingsHandler();

  /**
   * Local State
   */
  const [aiEmotionLocal, setAiEmotionLocal] = useState<string>(aiEmotion);

  const handleVoiceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newVoice = e.target.value as (typeof AI_VOICES)[number];
    setAiVoice(newVoice);
    updateSession('voice');
    updateSettings('voice');
    toast.success(
      `AI Voice changed to ${newVoice.charAt(0).toUpperCase() + newVoice.slice(1)}`
    );
  };

  const handleEmotionBlur = () => {
    if (aiEmotionLocal.length <= 200 && aiEmotionLocal !== aiEmotion) {
      setAiEmotion(aiEmotionLocal);
      updateSession('emotion');
      updateSettings('emotion');
      toast.success('AI Emotion updated');
    }
  };

  useImperativeHandle(ref, () => ({
    onSubmit: () => {
      if (aiEmotionLocal !== aiEmotion) {
        setAiEmotion(aiEmotionLocal);
        setAiVoice(aiVoice);
        updateSession('emotion');
        updateSession('voice');
        updateSettings('emotion');
        updateSettings('voice');
      }
    },
  }));

  return (
    <div className="flex flex-col items-start justify-center gap-y-6">
      {/* Voice Area */}
      <div className="w-full">
        <h1 className="font-semibold text-textColor">AI Voice :</h1>
        <p className="font-regular text-secText">
          Choose between different Voices for Sola AI.
        </p>
        <select
          className="border border-border rounded-md p-3 mt-2 bg-sec_background text-textColor"
          value={aiVoice || ''}
          onChange={handleVoiceChange}
        >
          <option value="" disabled>
            Select AI Voice
          </option>
          {AI_VOICES.map((voice) => (
            <option key={voice} value={voice}>
              {voice.charAt(0).toUpperCase() + voice.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Emotion Area */}
      <div className="w-full">
        <h1 className="font-semibold text-textColor">AI Emotion :</h1>
        <p className="font-regular text-secText">
          Change the way that Sola AI speaks to you.
        </p>
        <input
          type="text"
          className="border border-border rounded-md p-2 mt-2 bg-sec_background w-full text-textColor"
          placeholder="AI Emotion"
          maxLength={200}
          value={aiEmotionLocal}
          onBlur={handleEmotionBlur}
          onChange={(e) => setAiEmotionLocal(e.target.value)}
          aria-multiline={false}
        />
        <p className="text-xs text-secText mt-1">Maximum 200 characters</p>
      </div>
    </div>
  );
});

AIConfigSettings.displayName = 'AIConfigSettings';
