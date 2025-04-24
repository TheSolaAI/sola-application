'use client';

import React, { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  text: string;
  typingSpeed?: number;
  className?: string;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  text,
  typingSpeed = 15,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText('');
    setIsComplete(false);

    const typeText = () => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        currentIndex++;
        setTimeout(typeText, typingSpeed);
      } else {
        setIsComplete(true);
      }
    };

    const timer = setTimeout(typeText, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [text, typingSpeed]);

  return (
    <div className={className}>
      <span>{displayedText}</span>
      {!isComplete && (
        <span className="inline-block w-2 h-4 ml-1 bg-primaryDark animate-pulse"></span>
      )}
    </div>
  );
};

export default TypewriterEffect;
