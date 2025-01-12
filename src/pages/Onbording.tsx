import { usePrivy } from '@privy-io/react-auth';

function Onbording() {
  const { login, authenticated, ready } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);

  return (
    <>
      <div className="bg-white h-screen overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="mx-auto max-w-8xl sm:px-6 sm:py-18 lg:px-8 ">
          <div className="relative isolate h-screen overflow-hidden bg-gray-900 px-6 shadow-2xl sm:rounded-3xl sm:px-8 md:pt-24 lg:flex lg:gap-x-20 lg:px-16 lg:pt-12 ">
            <svg
              viewBox="0 0 1024 1024"
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -z-10 size-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
            >
              <circle
                r={512}
                cx={512}
                cy={512}
                fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>
            <div className="mx-auto my-8 max-w-md text-center lg:mx-0 lg:flex-auto lg:py-28 lg:text-left">
              <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
                Welcome to Sola AI. Voice assistant on Solana.
              </h2>
              <p className="mt-6 text-lg/8 text-pretty text-gray-300">
                Redefine your on-chain experience through voice commands.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                <button
                  onClick={() => login({loginMethods: ['email', 'wallet']})}
                  disabled={disableLogin}
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-xs hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Login to Sola AI
                </button>
                <a href="https://docs.solaai.xyz/" className="text-sm/6 font-semibold text-white">
                  Read Docs <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className="relative mt-16 h-80 lg:mt-8">
              <img
                alt="App screenshot"
                src="/app-screenshot.png"
                width={1800}
                height={1080}
                className="absolute top-0 -left-8 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Onbording;
