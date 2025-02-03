import { usePrivy } from '@privy-io/react-auth';
import 'react-awesome-button/dist/styles.css';
import '../css/buttons.css';
import { AwesomeButton, AwesomeButtonSocial } from 'react-awesome-button';
import useThemeManager from '../models/ThemeManager.ts';

function Onboarding() {
  const { login, authenticated, ready } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);

  const { theme, setTheme } = useThemeManager();

  return (
    <div className="bg-background h-screen overflow-hidden flex flex-col gap-4 items-center justify-center">
      {/*Top Bar starts*/}
      <div className="absolute top-0 w-full p-4 bg-primaryDark z-10 flex flex-row justify-between gap-2">
        <div className={'flex flex-row items-center gap-x-6'}>
          <img src="/logo.png" className={`h-11 w-11 rounded-xl`} />
          <a
            href="/"
            className=" hidden text-xl font-semibold text-textColor sm:block"
          >
            Sola AI
          </a>
        </div>

        <div className={'gap-x-2 flex flex-row'}>
          <AwesomeButtonSocial
            type="github"
            href="https://github.com/TheSolaAI/sola-application"
          >
            Github
          </AwesomeButtonSocial>
          <AwesomeButton
            type="secondary"
            onReleased={() =>
              setTheme(theme.baseTheme === 'dark' ? 'light' : 'dark')
            }
          >
            {theme.baseTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </AwesomeButton>
        </div>
      </div>
      {/*Top Bar ends*/}
      <div className="max-w-4xl px-6 sm:px-8 py-12">
        <div className="text-center  space-y-6 mt-24">
          <h2 className="text-3xl sm:text-4xl font-semibold text-textColor">
            Welcome to Sola AI. Voice assistant on Solana.
          </h2>
          <p className="text-lg text-secText text-center">
            Redefine your on-chain experience through voice commands.
          </p>

          <div className="flex justify-center gap-x-6 mt-10 items-center">
            <AwesomeButton
              onReleased={() => login({ loginMethods: ['email', 'wallet'] })}
              disabled={disableLogin}
              type="secondary"
            >
              Login to Sola AI
            </AwesomeButton>
            <a
              href="https://docs.solaai.xyz/"
              className="text-sm font-semibold text-textColor"
            >
              Read Docs <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="mt-12">
          <img
            alt="App screenshot"
            src="/app-screenshot.png"
            className="w-full rounded-lg shadow-xl"
          />
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
