import { Theme } from '../models/ThemeManager';

export interface UpdateUserSettingsRequest {
  theme?: string;
  voice_preference?: string;
  emotion_choice?: string;
  custom_themes?: Theme[];
  name?: string;
  profile_pic?: {
    color: string;
    initials: string;
  };
}
