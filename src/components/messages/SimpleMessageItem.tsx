'use client';
import { FC } from 'react';
import { SimpleMessageItem as BaseSimpleMessageItem } from './base/SimpleMessageItem';

interface SimpleMessageItemProps {
  text: string;
}

export const SimpleMessageItem: FC<SimpleMessageItemProps> = ({ text }) => {
  return <BaseSimpleMessageItem text={text} />;
};
