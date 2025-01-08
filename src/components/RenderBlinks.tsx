import '@dialectlabs/blinks/index.css';


import { Blink, useAction, useActionsRegistryInterval } from "@dialectlabs/blinks";
import { BLINKSMAPPING } from '../store/blinks/blinksMapping';

// implement custom wallet adapter

import useActionSolanaWalletAdapter from '../hooks/useActionSolanaWalletAdapter';
import Loader from '../common/Loader';

const helius_api_key = process.env.HELIUS_API_KEY;
const rpc = `https://mainnet.helius-rpc.com/?api-key=${helius_api_key}`;

//import custom action

//blinks to play games
//todo impl store for all blinks actions


interface RenderBlinksProps {
  actionApiUrl: string;
}
const RenderBlinks = ({ actionApiUrl }: RenderBlinksProps) => {
  if (!(actionApiUrl in BLINKSMAPPING)) {
    return <div> error blinks not found</div>
    }
    
    useActionsRegistryInterval();
    const { adapter } = useActionSolanaWalletAdapter(rpc);
    const { action, isLoading } = useAction({url: actionApiUrl});

    return (
        <>
      {/* <ActionsRegistry /> */}
                {!isLoading && action ? (
                <Blink action={ action } adapter={adapter} />
            ):(
            <Loader/>
        )
    }
        </>
    )
}

export default RenderBlinks;
