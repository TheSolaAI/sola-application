import React from 'react';
import { motion } from 'framer-motion';
import {
  FaTwitter,
  FaDiscord,
  FaGithub,
  FaTelegram,
  FaExchangeAlt,
} from 'react-icons/fa';
import SolaLogo from '@/components/common/SolaLogo';

export default function Footer() {
  // Animation variants
  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const socialLinks = [
    {
      icon: <FaTwitter />,
      name: 'Twitter',
      href: 'https://x.com/thesolaai',
    },
    {
      icon: <FaDiscord />,
      name: 'Discord',
      href: 'https://discord.gg/P3FR7UNxdx',
    },
    {
      icon: <FaTelegram />,
      name: 'Telegram',
      href: 'https://t.me/solaai_portal',
    },
    {
      icon: <FaGithub />,
      name: 'GitHub',
      href: 'https://github.com/TheSolaAI/sola-application',
    },
  ];

  const infoLinks = [
    { name: 'CodeBase', href: 'https://github.com/TheSolaAI/sola-application' },
    { name: 'Documentation', href: 'https://docs.solaai.xyz/' },
    { name: 'Uptime Monitor', href: '/status' },
    { name: 'Media', href: 'https://app.brandyhq.com/sola' },
    { name: 'Privacy Notice', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  const exchangeLinks = [
    {
      name: 'Gate.io',
      href: 'https://www.gate.io/fr/pilot/solana/sola-ai-sola',
    },
    { name: 'MEXC', href: 'https://www.mexc.com/exchange/SOLA_USDT' },
    { name: 'LBank', href: 'https://www.lbank.com/trade/sola_usdt' },
    { name: 'XT Exchange', href: 'https://www.xt.com/en/trade/sola_usdt' },
    { name: 'KCEX', href: 'https://www.kcex.com/exchange/SOLA_USDT' },
  ];

  return (
    <footer className="border-t border-white/10 bg-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-12"
        >
          {/* Logo and description */}
          <motion.div variants={fadeInUp} className="lg:col-span-3">
            <div className="flex items-center space-x-2">
              <a href="#" className="-m-1.5 p-1.5 flex items-center gap-3">
                <span className="sr-only">Sola AI</span>
                <SolaLogo className="text-white h-8 w-8" />
                <span className="text-white font-semibold text-lg hidden sm:block">
                  Sola AI
                </span>
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Voice assistant for Solana - perform on-chain actions using just
              your voice or text commands.
            </p>
          </motion.div>

          {/* Social links */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-2 lg:col-start-5"
          >
            <h3 className="text-sm font-semibold text-indigo-400">
              Connect with us
            </h3>
            <ul className="mt-4 space-y-4">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group flex items-center text-sm text-gray-400 transition hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="mr-3 text-gray-500 transition group-hover:text-indigo-400">
                      {link.icon}
                    </span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CEX Listed */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-3 lg:col-start-8"
          >
            <h3 className="text-sm font-semibold text-indigo-400 flex items-center">
              <FaExchangeAlt className="mr-2 text-indigo-400" />
              CEX Listed
            </h3>
            <ul className="mt-4 space-y-4">
              {exchangeLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group flex items-center text-sm text-gray-400 transition hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="w-1 h-1 rounded-full bg-indigo-500 mr-2"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Info links */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-2 lg:col-start-11"
          >
            <h3 className="text-sm font-semibold text-indigo-400">Resources</h3>
            <ul className="mt-4 space-y-4">
              {infoLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 transition hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom copyright */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 border-t border-white/10 pt-8 text-center"
        >
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Sola AI. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-6">
            <motion.div
              className="h-1 w-1 rounded-full bg-indigo-500"
              animate={{
                boxShadow: [
                  '0 0 3px #6366f1',
                  '0 0 8px #6366f1',
                  '0 0 3px #6366f1',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
            <motion.div
              className="h-1 w-1 rounded-full bg-indigo-500"
              animate={{
                boxShadow: [
                  '0 0 3px #6366f1',
                  '0 0 8px #6366f1',
                  '0 0 3px #6366f1',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 0.5,
              }}
            />
            <motion.div
              className="h-1 w-1 rounded-full bg-indigo-500"
              animate={{
                boxShadow: [
                  '0 0 3px #6366f1',
                  '0 0 8px #6366f1',
                  '0 0 3px #6366f1',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 1,
              }}
            />
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
