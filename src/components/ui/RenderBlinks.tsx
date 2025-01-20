import '@dialectlabs/blinks/index.css';

import {
    Blink,
    useAction,
    useActionsRegistryInterval,
  } from '@dialectlabs/blinks';
  import { useActionSolanaWalletAdapter } from '../../hooks/useActionSolanaWalletAdapter';
  import { BLINKGAMES } from '../../store/blinks/games'; 
  interface RenderBlinksProps {
    actionName: string;
  }
  function RenderBlinks({ actionName }: RenderBlinksProps) {
    useActionsRegistryInterval();
    console.log(BLINKGAMES[actionName as keyof typeof BLINKGAMES])
    if (!(actionName in BLINKGAMES)) {
      return <div>Invalid action name</div>;
    }
    
    const rpc = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
    const { adapter } = useActionSolanaWalletAdapter(rpc);
    const { action, isLoading } = useAction({
      url: `solana-action:${BLINKGAMES[actionName as keyof typeof BLINKGAMES]}`,
    });
    return (
      <>
        {!isLoading && action ? (
          <Blink action={action} adapter={adapter} />
        ) : (
          <div>Loading blinks</div>
        )}
      </>
    );
  }
  export default RenderBlinks;