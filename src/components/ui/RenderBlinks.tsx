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

  const rpc =
    import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { adapter } = useActionSolanaWalletAdapter(rpc);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { action, isLoading } = useAction({
    url: `solana-action:${BLINKGAMES[actionName as keyof typeof BLINKGAMES]}`,
  });
  return (
    <>
      {!isLoading && action ? (
        <Blink action={action} adapter={adapter} />
      ) : (
        <div className="text-primaryDark text-sm">Loading blinks</div>
      )}
    </>
  );
}
export default RenderBlinks;
