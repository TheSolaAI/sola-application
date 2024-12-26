import { usePrivy } from '@privy-io/react-auth';
import Button from '../components/Button';

function Onbording() {
  const { login, authenticated, ready } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);
  return (
    <>
      <div className="flex justify-center items-center bg-bodydark1 h-screen w-screen">
        <Button
          onClick={login}
          disable={disableLogin}
          className="bg-whiter text-body text-lg font-bold"
        >
          Login to Sola AI
        </Button>
      </div>
    </>
  );
}

export default Onbording;
