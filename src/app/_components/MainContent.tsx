'use client'

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Dropdown } from '@/components/common/DropDown';
import Image from 'next/image';
import Link from 'next/link';
import useIsMobile from '@/utils/isMobile';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import 'react-awesome-button/dist/styles.css';
import AnimatedButton from "@/components/common/AnimatedButton";
import {useRouter} from "next/navigation";

export default function MainContent() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const { login } = useLogin({
    onComplete: (params) => {
      console.log(params);
      router.push('/dashboard');
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const isMobile = useIsMobile();
  const disableLogin = !ready || (ready && authenticated);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  const contentProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.4, ease: 'easeOut' },
  };

  return (
    <motion.div {...contentProps} className="max-w-4xl px-6 sm:px-8 py-12">
      <div className="text-center space-y-6 mt-24">
        <div className="text-3xl sm:text-4xl font-semibold text-textColor">
          Welcome to Sola AI. Voice Assistant on Solana.
        </div>
        <div className="text-lg text-secText text-center">
          Redefine your on-chain experience through voice commands.
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-y-4 gap-x-6 mt-10 items-center">

          <AnimatedButton
              onClick={()=>login()}
              disabled={disableLogin}
          >
            {isMobile ? 'Get Started' : 'Login to Sola AI'}
          </AnimatedButton>

          {isMobile ? (
            <div className="relative" ref={downloadRef}>
              <button
                onClick={() => setIsDownloadOpen(true)}
                className="px-6 py-3 text-textColorContrast text-lg font-semibold rounded-lg bg-backgroundContrast hover:bg-surface hover:text-textColor transition duration-300 shadow-md"
              >
                Download
              </button>

              <Dropdown
                isOpen={isDownloadOpen}
                onClose={() => setIsDownloadOpen(false)}
                anchorEl={downloadRef.current}
                title="Download Options"
                mobileTitle="Download Sola AI"
                direction="down"
                horizontalAlignment="left"
              >
                <div className="space-y-2 my-4">
                  {[
                    {
                      number: '1',
                      text: 'Tap the "Menu" button in your browser',
                    },
                    { number: '2', text: 'Add to Home Screen' },
                  ].map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 rounded-lg bg-gray-800"
                    >
                      <span className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-700 text-white font-semibold">
                        {step.number}
                      </span>
                      <p className="text-white">{step.text}</p>
                    </div>
                  ))}
                </div>
              </Dropdown>
            </div>
          ) : (
            <Link
              href="https://docs.solaai.xyz/"
              className="text-sm font-semibold text-textColor"
            >
              Read Docs <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>
      <motion.div
        {...contentProps}
        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        className="mt-12 relative w-full aspect-video"
      >
        <Image
          alt="App screenshot"
          src="/app-screenshot.png"
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          priority
          className="rounded-lg shadow-xl object-cover"
        />
      </motion.div>
    </motion.div>
  );
}