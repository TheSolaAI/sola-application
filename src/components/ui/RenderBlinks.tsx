import '@dialectlabs/blinks/index.css';

import {
  Blink,
  useAction,
  useActionsRegistryInterval,
} from '@dialectlabs/blinks';
import { useActionSolanaWalletAdapter } from '../../hooks/useActionSolanaWalletAdapter';
import { BLINKGAMES } from '../../config/blinks/games';
interface RenderBlinksProps {
  actionName: string;
}
function RenderBlinks({ actionName }: RenderBlinksProps) {
  useActionsRegistryInterval();

  if (!(actionName in BLINKGAMES)) {
    return <div>Invalid action name</div>;
  }

  const rpc = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { adapter } = useActionSolanaWalletAdapter(rpc);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { action, isLoading } = useAction({
    url: `solana-action:${BLINKGAMES[actionName as keyof typeof BLINKGAMES]}`,
  });
  return (
    <>
      {!isLoading && action ? (
        <div className="w-3/5">
          <Blink action={action} adapter={adapter} />
        </div>
      ) : (
        <div className="text-gray-700 text-sm dark:text-graydark">
          Loading blinks
        </div>
      )}
    </>
  );
}
export default RenderBlinks;
