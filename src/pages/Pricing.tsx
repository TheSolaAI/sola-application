import React, { useState } from 'react';
import { CheckIcon, SparklesIcon, ZapIcon, RocketIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Tier {
  name: string;
  id: string;
  href: string;
  priceMonthly: string;
  credits: string;
  description: string;
  features: string[];
  featured: boolean;
  icon: React.FC<{ className?: string }>;
  gradient: string;
  hoverGradient: string;
}

const tiers: Tier[] = [
  {
    name: 'Visitor',
    id: 'tier-hobby',
    href: '#',
    priceMonthly: '0.1 SOL',
    credits: '1K Credits',
    description:
      "The perfect plan if you're just getting started with our product.",
    features: ['Dedicated Support', 'Join platform governance'],
    featured: false,
    icon: ZapIcon,
    gradient: 'from-blue-500/20 to-purple-500/20',
    hoverGradient: 'from-blue-500/30 to-purple-500/30',
  },
  {
    name: 'Contributor',
    id: 'tier-enterprise',
    href: '#',
    priceMonthly: '1 SOL',
    credits: '10K Credits',
    description:
      'If you regularly want to use and contribute to the platform development.',
    features: [
      'Everything in Basic +',
      'Platform collaboration rewards',
      'Boosted entries in community collabs',
    ],
    featured: true,
    icon: RocketIcon,
    gradient: 'from-pink-500/20 to-orange-500/20',
    hoverGradient: 'from-pink-500/30 to-orange-500/30',
  },
];

const Pricing: React.FC = () => {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  return (
    <div className="h-screen max-h-screen flex flex-col">
      <div className="flex-grow overflow-y-auto scrollbar scrollbar-thumb-primaryDark">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-base font-semibold leading-7 text-primaryDark">
                Pricing
              </h2>
              <p className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                Purchase Platform Credits
              </p>
            </motion.div>

            <motion.p
              className="mx-auto mt-6 max-w-4xl text-lg text-gray-500 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Sola AI is currently in its{' '}
              <span className="font-bold text-primaryDark">
                Early Access Program (EAP)
              </span>{' '}
              and is continuously evolving with new integrations and features.
              Your support directly contributes to its ongoing maintenance and
              growth.
            </motion.p>
          </div>

          <motion.div
            className="mx-auto mt-12 max-w-4xl grid grid-cols-1 gap-8 lg:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {tiers.map((tier, tierIdx) => {
              const isHovered = hoveredTier === tier.id;
              const Icon = tier.icon;

              return (
                <motion.div
                  key={tier.id}
                  className={`
                  relative rounded-2xl 
                  ${tier.featured ? 'lg:scale-105 z-10' : 'lg:scale-100'}
                `}
                  onMouseEnter={() => setHoveredTier(tier.id)}
                  onMouseLeave={() => setHoveredTier(null)}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                >
                  {/* Background with gradient */}
                  <div
                    className={`absolute inset-0 transition-all duration-300 ${isHovered ? tier.hoverGradient : tier.gradient}`}
                  />

                  {/* Content */}
                  <div
                    className={`
                  relative z-10 p-8 sm:p-10 h-full flex flex-col
                  ${tier.featured ? 'bg-backgroundContrast border-2 border-primaryDark' : 'bg-sec_background border border-gray-900/10'} 
                  rounded-2xl backdrop-blur-sm
                `}
                  >
                    {tier.featured && (
                      <div className="absolute -top-5 -right-5 bg-primaryDark text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg transform rotate-12">
                        POPULAR
                      </div>
                    )}

                    <div className="flex items-center">
                      <div
                        className={`
                      p-2 rounded-xl 
                      ${tier.featured ? 'bg-primaryDark/20' : 'bg-primaryDark/10'}
                    `}
                      >
                        <Icon
                          className={`h-6 w-6 ${tier.featured ? 'text-primaryDark' : 'text-primaryDark/80'}`}
                        />
                      </div>
                      <h3
                        id={tier.id}
                        className="ml-3 text-xl font-bold text-primaryDark"
                      >
                        {tier.name}
                      </h3>
                    </div>

                    <div className="mt-6 flex items-baseline">
                      <span
                        className={`${tier.featured ? 'text-textColorContrast/85' : 'text-textColor/85'}
                        text-5xl font-extrabold tracking-tight`}
                      >
                        {tier.priceMonthly}
                      </span>
                      <span
                        className={`${tier.featured ? 'text-textColorContrast/80' : 'text-secText'} text-lg ml-2`}
                      >
                        /{tier.credits}
                      </span>
                    </div>

                    <p
                      className={`${tier.featured ? 'text-textColorContrast/80' : 'text-secText'} mt-6 text-base`}
                    >
                      {tier.description}
                    </p>

                    <ul role="list" className="mt-8 space-y-4 flex-grow">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-start gap-x-3 ${tier.featured ? 'text-textColorContrast/80' : 'text-secText'}`}
                        >
                          <div
                            className={`${tier.featured ? 'bg-primaryDark' : 'bg-primaryDark/80'} rounded-full p-1 mt-1`}
                          >
                            <CheckIcon
                              className="h-3.5 w-3.5 text-white"
                              aria-hidden="true"
                            />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <motion.a
                      href={tier.href}
                      aria-describedby={tier.id}
                      className={`
                      mt-8 block rounded-xl py-3.5 px-3.5 text-center text-sm font-semibold shadow-sm
                      transition-all duration-300
                      ${
                        tier.featured
                          ? 'text-white bg-primaryDark hover:bg-primary'
                          : 'text-white bg-primary hover:bg-primaryDark'
                      }
                    `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Purchase Now
                    </motion.a>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            className="mt-16 mx-auto max-w-4xl text-center px-6 py-8 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-500/20 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex justify-center mb-4">
              <SparklesIcon className="h-8 w-8 text-primaryDark" />
            </div>
            <h3 className="text-xl font-semibold text-textColor/90">
              Your support matters
            </h3>
            <p className="mt-3 text-base text-gray-500">
              Purchasing credits not only gives you full access to our platform
              but also directly funds our development team and accelerates
              improvements, making Sola AI even better for everyone.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
