import { addCalenderEvent } from "./functions/addCalenderEvent";
import { getNFTLaunchpad } from "./functions/getLaunchpadCollections";
import { swapTokens } from "./functions/swapTokens";
import { toggleWallet } from "./functions/toggleWallet";
import { getLuloAssets } from './functions/getLuloAssets';
import { depositLulo } from './functions/depositLulo';
import { withdrawLulo } from './functions/withdrawLulo';
import { transferSolTx } from './functions/transferSolTx';

export const tools = {
  type: 'session.update',
  session: {
    tools: [
      toggleWallet,
      swapTokens,
      addCalenderEvent,
      getNFTLaunchpad,
      getLuloAssets,
      depositLulo,
      withdrawLulo,
      transferSolTx,
    ],
    tool_choice: 'auto',
  },
};
