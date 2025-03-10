'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function MobileContent() {
  const contentProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.4, ease: 'easeOut' },
  };

  return (
    <motion.div {...contentProps} className="max-w-4xl px-6 sm:px-8 py-12">
      <div className="text-center space-y-2 mt-24">
        <div className="text-3xl sm:text-4xl font-semibold text-textColor">
          Take Sola AI Anywhere with You!
        </div>
        <div className="text-lg text-secText text-center">
          Download the app for the best on-the-go experience!
        </div>
      </div>
      <motion.div
        {...contentProps}
        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        className="flex mt-12 w-full justify-center"
      >
        <div className="relative w-90 h-90">
          <Image
            alt="App screenshot"
            src="/qr.png"
            width={360}
            height={360}
            className="rounded-lg shadow-xl"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
