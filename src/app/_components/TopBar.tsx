'use client';

import { motion } from 'framer-motion';
import { FaGithub, FaMobileAlt } from 'react-icons/fa';
import { HiComputerDesktop } from 'react-icons/hi2';
import Image from 'next/image';
import useThemeManager from '@/store/ThemeManager';
import useIsMobile from '@/utils/isMobile';
import Link from 'next/link';

interface TopBarProps {
  isMobileLogin: boolean;
  setIsMobileLogin: (value: boolean) => void;
}

export default function TopBar({
  isMobileLogin,
  setIsMobileLogin,
}: TopBarProps) {
  const { theme } = useThemeManager();
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute top-2 w-[60%] rounded-2xl p-3 bg-backgroundContrast bg-opacity-90 z-10 flex flex-row justify-between gap-2"
    >
      <div className="flex flex-row h-full self-center items-center gap-x-3">
        <div
          className={`h-8 w-8 rounded-xl fill-textColor relative ${
            theme.name === 'dark'
              ? 'bg-light-backgroundContrast'
              : 'bg-background'
          }`}
        >
          <Image
            src="/sola_black_logo.svg"
            alt="logo"
            fill
            sizes="2rem"
            className="object-contain"
          />
        </div>
        <Link
          href="/"
          className="hidden text-xl font-semibold text-textColorContrast sm:block"
        >
          Sola AI
        </Link>
      </div>
      <div className="flex gap-2 items-center ">
        {!isMobile && (
          <button
            className="h-12"
            onClick={() => setIsMobileLogin(!isMobileLogin)}
          >
            {isMobileLogin ? (
              <div className="flex flex-row items-center justify-center">
                <HiComputerDesktop className="mr-2" />
                Web App
              </div>
            ) : (
              <div className="flex flex-row items-center justify-center">
                <FaMobileAlt className="mr-2" />
                Mobile
              </div>
            )}
          </button>
        )}
        <button>
          <div className="flex items-center justify-center">
            <FaGithub className="mr-2" />
            <span>Github</span>
          </div>
        </button>
      </div>
    </motion.div>
  );
}
