import React, { ReactNode } from 'react';
import useThemeManager from '../../models/ThemeManager';
import { Bot } from 'lucide-react';

interface MonoGridBoxProps {
  index: number;
  children: ReactNode;
}

export default function MonoGridBox({
  index,
  children,
}: MonoGridBoxProps) {
  const { theme } = useThemeManager();
  const childrenArray = React.Children.toArray(children);
  const [img, div1, div2, div3] = childrenArray;
  return (
    <div
      key={index}
      className="flex gap-2 my-1 md:gap-4 justify-start max-w-[90%] md:max-w-[80%] transition-opacity duration-500 overflow-y-auto"
    >
      {' '}
      <div className="opacity-0">
        <Bot color={theme.secText} />
      </div>
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-2 w-full rounded-lg break-words whitespace-normal`}
      >
        <div className="flex gap-4 items-center p-4 rounded-lg bg-sec_background text-secText ">
          <div>{img}</div>
          <div className="flex flex-col">
            {div1}
            {div2}
            {div3}
          </div>
        </div>
      </div>
    </div>
  );
}
