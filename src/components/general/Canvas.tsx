import { FC } from 'react';

interface CanvasProps {
  children: React.ReactNode;
}

export const Canvas: FC<CanvasProps> = ({ children }) => {
  return <div>{children}</div>;
};
