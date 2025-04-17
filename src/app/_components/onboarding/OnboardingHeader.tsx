'use client';

import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { FaXmark } from 'react-icons/fa6';
import { useState, Fragment } from 'react';
import { HiBars3 } from 'react-icons/hi2';
import SolaLogo from '@/components/common/SolaLogo';
import { motion } from 'framer-motion';

interface OnboardingHeaderProps {
  login: () => void;
  disabled: boolean;
}

const navigation = [
  { name: 'Github', href: 'https://github.com/TheSolaAI/sola-application' },
  { name: 'Docs', href: 'https://docs.solaai.xyz/' },
  { name: 'Explore SOLA Ecosystem', href: 'https://solaai.xyz/' },
];

export default function OnboardingHeader({
  login,
  disabled,
}: OnboardingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute inset-x-0 top-0 z-50"
    >
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex lg:flex-1"
        >
          <a href="#" className="-m-1.5 p-1.5 flex items-center gap-3">
            <span className="sr-only">Sola AI</span>
            <SolaLogo className="text-white h-8 w-8" />
            <span className="text-white font-semibold text-lg hidden sm:block">
              Sola AI
            </span>
          </a>
        </motion.div>

        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300 hover:text-white transition-colors duration-200"
          >
            <span className="sr-only">Open main menu</span>
            <HiBars3 aria-hidden="true" className="size-6" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden lg:flex lg:gap-x-12"
        >
          {navigation.map((item, index) => (
            <motion.a
              key={item.name}
              href={item.href}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              className="text-sm/6 font-semibold text-gray-300 hover:text-white transition-colors duration-200"
            >
              {item.name}
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="hidden lg:flex lg:flex-1 lg:justify-end"
        >
          <motion.button
            onClick={() => login()}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm/6 font-semibold text-gray-300 hover:text-white transition-colors duration-200"
          >
            Log in <span aria-hidden="true">&rarr;</span>
          </motion.button>
        </motion.div>
      </nav>

      {/* Mobile menu dialog with transitions */}
      <Transition appear show={mobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="lg:hidden relative z-50"
          onClose={setMobileMenuOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-end text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-x-full"
                enterTo="opacity-100 translate-x-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 translate-x-full"
              >
                <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-gray-900/95 backdrop-blur-sm px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10 transform transition-all text-left">
                  <div className="flex items-center justify-between">
                    <a
                      href="#"
                      className="-m-1.5 p-1.5 flex items-center gap-2"
                    >
                      <span className="sr-only">Sola AI</span>
                      <SolaLogo className="text-white h-7 w-7" />
                      <span className="text-white font-semibold">Sola AI</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-m-2.5 rounded-md p-2.5 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    >
                      <span className="sr-only">Close menu</span>
                      <FaXmark aria-hidden="true" className="size-6" />
                    </button>
                  </div>
                  <div className="mt-6 flow-root">
                    <div className="-my-6 divide-y divide-gray-500/25">
                      <div className="space-y-2 py-6">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-gray-800 transition-colors duration-200"
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                      <div className="py-6">
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            login();
                          }}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-gray-800 transition-colors duration-200 w-full text-left"
                        >
                          Log in
                        </button>
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </motion.header>
  );
}
