import Image from 'next/image';
import { motion } from 'framer-motion';
import { IoMdSpeedometer } from 'react-icons/io';

export default function BentoGrid() {
  // Animation variants
  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const pulseVariant = {
    hidden: { scale: 0.95, opacity: 0.8 },
    visible: {
      scale: [0.95, 1.05, 0.95],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'loop',
      },
    },
  };

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          variants={fadeInUp}
        >
          <h2 className="text-center text-base/7 font-semibold text-indigo-400">
            Sola AI Features
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
            Power at Your Fingertips ⚡️
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
          className="mt-10 grid gap-5 sm:mt-16 lg:grid-cols-3 lg:auto-rows-fr"
        >
          {/* Mobile Friendly Card */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="relative row-span-2"
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="absolute inset-px rounded-lg bg-gradient-to-br from-white/5 to-white/10 lg:rounded-l-[1.5rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(1.5rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-100 max-lg:text-center">
                  Mobile friendly
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400 max-lg:text-center">
                  Access our full-featured application directly from your mobile
                  device using our Progressive Web App.
                </p>
              </div>
              <div className="@container relative min-h-[18rem] w-full max-w-[260px] mx-auto grow">
                <div className="absolute left-1/2 transform -translate-x-1/2 top-8 bottom-0 w-full overflow-hidden rounded-[24px] border-2 border-gray-700 bg-gray-900 shadow-2xl">
                  <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 flex justify-center items-center">
                    <div className="w-4 h-1.5 bg-gray-600 rounded-full"></div>
                  </div>
                  <Image
                    className="absolute top-6 left-0 w-full h-[calc(100%-6px)] object-cover object-top"
                    src="/app-screenshot-mobile.png"
                    alt="Mobile app interface"
                    fill={true}
                  />
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-white/10 lg:rounded-l-[1.5rem]"></div>
          </motion.div>

          {/* Realtime Actions Card */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="relative max-lg:row-start-1"
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="absolute inset-px rounded-lg bg-gradient-to-br from-white/5 to-white/10 max-lg:rounded-t-[1.5rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(1.5rem+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-100 max-lg:text-center">
                  Realtime Actions
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400 max-lg:text-center">
                  Seamlessly perform on-chain actions in real-time using just
                  your voice or text commands.
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="bg-indigo-900/30 h-24 w-24 rounded-full flex items-center justify-center">
                  <motion.div
                    className="bg-indigo-500/80 h-16 w-16 rounded-full items-center justify-center flex"
                    animate={{
                      boxShadow: [
                        '0 0 10px #6366f1',
                        '0 0 20px #6366f1',
                        '0 0 10px #6366f1',
                      ],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  >
                    <IoMdSpeedometer className="text-white w-10 h-10" />
                  </motion.div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-white/10 max-lg:rounded-t-[1.5rem]"></div>
          </motion.div>

          {/* Security Card */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2"
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="absolute inset-px rounded-lg bg-gradient-to-br from-white/5 to-white/10"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-100 max-lg:text-center">
                  Security
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400 max-lg:text-center">
                  Link your favorite app wallet or use our built-in secure
                  wallet (provided by Privy) to perform actions with confidence.
                </p>
              </div>
              <div className="@container flex flex-1 items-center justify-center p-6">
                <div className="relative w-full h-40 flex items-center justify-center">
                  <motion.div
                    className="absolute w-24 h-24 rounded-full bg-indigo-900/30 flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        '0 0 5px #6366f1',
                        '0 0 20px #6366f1',
                        '0 0 5px #6366f1',
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  >
                    <motion.div
                      className="w-16 h-16 rounded-full bg-indigo-800/50 flex items-center justify-center"
                      variants={pulseVariant}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div
                        className="w-10 h-10 rounded-full bg-indigo-600/80 flex items-center justify-center text-white"
                        whileHover={{
                          rotate: 180,
                          transition: { duration: 0.5 },
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-white/10"></div>
          </motion.div>

          {/* Open Source Card */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="relative row-span-2"
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="absolute inset-px rounded-lg bg-gradient-to-br from-white/5 to-white/10 max-lg:rounded-b-[1.5rem] lg:rounded-r-[1.5rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(1.5rem+1px)] lg:rounded-r-[calc(1.5rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-100 max-lg:text-center">
                  Open Source
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-400 max-lg:text-center">
                  Our platform is fully open source, providing transparency and
                  allowing developers to explore, contribute, and build trust in
                  our development process.
                </p>
              </div>
              <div className="relative min-h-[22rem] w-full grow">
                <motion.div
                  className="absolute top-6 right-0 bottom-0 left-6 overflow-hidden rounded-xl bg-gray-900 shadow-2xl"
                  whileHover={{
                    boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
                    transition: { duration: 0.3 },
                  }}
                >
                  <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                    <div className="-mb-px flex text-sm/6 font-medium text-gray-400">
                      <div className="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">
                        Sola_AI.tsx
                      </div>
                      <div className="border-r border-gray-600/10 px-4 py-2">
                        App.tsx
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pt-6 pb-8 text-gray-400 font-mono text-sm">
                    <span className="text-indigo-400">import</span>{' '}
                    <span className="text-white">React</span>{' '}
                    <span className="text-indigo-400">from</span>{' '}
                    <span className="text-green-400">&#39;react'</span>;<br />
                    <br />
                    <span className="text-indigo-400">const</span>{' '}
                    <span className="text-yellow-400">SolaAI</span> = () =&gt;{' '}
                    {`{`}
                    <br />
                    &nbsp;&nbsp;<span className="text-indigo-400">
                      return
                    </span>{' '}
                    (<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;
                    <span className="text-green-400">div</span>&gt;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;
                    <span className="text-green-400">h1</span>&gt;Voice
                    Assistant for Solana&lt;/
                    <span className="text-green-400">h1</span>&gt;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;/
                    <span className="text-green-400">div</span>&gt;
                    <br />
                    &nbsp;&nbsp;);
                    <br />
                    {`}`};<br />
                    <br />
                    <span className="text-indigo-400">export</span>{' '}
                    <span className="text-indigo-400">default</span>{' '}
                    <span className="text-yellow-400">SolaAI</span>;
                  </div>
                </motion.div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-white/10 max-lg:rounded-b-[1.5rem] lg:rounded-r-[1.5rem]"></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
