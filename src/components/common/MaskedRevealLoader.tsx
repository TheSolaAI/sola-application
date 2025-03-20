'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScaleLoader } from 'react-spinners';
import useThemeManager from '@/store/ThemeManager';

export const MaskedRevealLoader: ({
  isLoading,
  children,
  duration,
  backgroundColor,
}: {
  isLoading?: any;
  children: any;
  duration?: any;
  backgroundColor?: any;
}) => React.JSX.Element = ({
  isLoading = false,
  children,
  duration = 1,
  backgroundColor = 'black',
}) => {
  const [showLoader, setShowLoader] = useState(isLoading);
  const { theme } = useThemeManager();

  useEffect(() => {
    setShowLoader(isLoading);
  }, [isLoading]);

  const loaderVariants = {
    initial: {
      clipPath: 'circle(0% at 50% 50%)',
      transition: {
        duration: duration,
        ease: 'easeInOut',
      },
    },
    animate: {
      clipPath: 'circle(150% at 50% 50%)',
      transition: {
        duration: duration,
        ease: 'easeInOut',
      },
    },
    exit: {
      clipPath: 'circle(0% at 50% 50%)',
      transition: {
        duration: duration,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className={'relative w-full h-full'}>
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="loader"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={loaderVariants}
            style={{
              width: '100%',
              backgroundColor: backgroundColor,
              zIndex: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            className={'rounded-2xl h-full absolute top-0'}
          >
            <ScaleLoader color={theme.textColor} height={80} width={20} />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          opacity: showLoader ? 0 : 1,
          transition: `opacity ${duration}s ease-in-out`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
