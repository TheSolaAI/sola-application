

import { AudioLines } from 'lucide-react';
import useThemeManager from '../../../models/ThemeManager.ts';
import { AiProjectsClassificationChatContent } from '../../../types/chatItem.ts';

interface AiProjectsChatItemProps {
  props: AiProjectsClassificationChatContent;
}

export const AiProjects = ({ props }: AiProjectsChatItemProps) => {
  const { theme } = useThemeManager();

  return (
    <div className="flex flex-row-reverse items-start my-1 py-1 gap-2 md:gap-4 max-w-[100%] md:max-w-[90%] overflow-hidden">
      <div>
        <AudioLines color={theme.secText} strokeWidth={1.2} />
      </div>
      <div className="flex text-secText justify-end rounded-lg">

      </div>
    </div>
  );
};
