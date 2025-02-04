import { CheckIcon } from 'lucide-react';

const tiers = [
  {
    name: 'Basic',
    id: 'tier-hobby',
    href: '#',
    priceMonthly: '0.1 SOL',
    credits: '1K Credits',
    description:
      "The perfect plan if you're just getting started with our product.",
    features: ['Dedicated Support', 'Join platform governance'],
    featured: false,
  },
  {
    name: 'Whales',
    id: 'tier-enterprise',
    href: '#',
    priceMonthly: '1 SOL',
    credits: '10K Credits',
    description: 'Exclusive early access to new features and priority support.',
    features: [
      'Everything in Basic +',
      'Platform colabration rewards',
      'Advanced analytics',
    ],
    featured: true,
  },
];

export default function Pricing() {
  return (
    <div>
      <div className="mx-auto text-center">
        <p className="mt-8 text-5xl font-semibold tracking-tight text-textColor/85">
          Purchase Platform Credits
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-gray-500">
          Funds collected will be used for integrations, blockchain data access,
          server upkeep, and essential operations to build and maintain platform
          stability and performance.
        </p>
      </div>

      <div className="mx-auto grid grid-cols-1 items-center gap-y-2 mt-8 md:gap-y-0 md:max-w-3xl lg:grid-cols-2">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={`
              ${tier.featured ? 'relative bg-backgroundContrast' : 'bg-sec_background sm:mx-8 lg:mx-0'} 
              ${
                tier.featured
                  ? ''
                  : tierIdx === 0
                    ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl'
                    : 'sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none'
              } 
              rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10
            `}
          >
            <h3
              id={tier.id}
              className={`text-primaryDark text-base/7 font-semibold`}
            >
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span
                className={`${tier.featured ? 'text-textColorContrast/85' : 'text-textColor/85'}
                  text-5xl font-semibold tracking-tight `}
              >
                {tier.priceMonthly}
              </span>
              <span
                className={`${tier.featured ? 'text-textColorContrast/80' : 'text-secText'} text-base`}
              >
                /{tier.credits}
              </span>
            </p>
            <p
              className={`${tier.featured ? 'text-textColorContrast/80' : 'text-secText'} mt-6 text-base/7 `}
            >
              {tier.description}
            </p>
            <ul
              role="list"
              className={`${tier.featured ? 'text-textColorContrast/80' : 'text-secText'}
                 mt-8 space-y-3 text-sm/6 sm:mt-10 `}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon
                    aria-hidden="true"
                    className={` text-primaryDark 'h-6 w-5 flex-none`}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={tier.href}
              aria-describedby={tier.id}
              className={`${
                tier.featured
                  ? 'text-textColorContrast bg-primaryDark shadow-xs hover:bg-primary'
                  : 'text-textColor bg-primary hover:bg-primaryDark '
              } 
                block rounded-md mt-8 px-3.5 py-2.5 text-center text-sm font-semibold sm:mt-10 `}
            >
              Purchase Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
