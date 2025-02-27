import { Theme } from '../models/ThemeManager';

export interface UpdateUserSettingsRequest {
  theme?: string;
  voice_preference?: string;
  emotion_choice?: string;
  custom_themes?: Theme[];
}
