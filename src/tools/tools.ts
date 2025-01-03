import { addCalenderEvent } from "./functions/addCalenderEvent";
import { getNFTLaunchpad } from "./functions/getLaunchpadCollections";
import { swapTokens } from "./functions/swapTokens";
import { toggleWallet } from "./functions/toggleWallet";
import { getLuloAssets } from './functions/getLuloAssets';
import { depositLulo } from './functions/depositLulo';
import { withdrawLulo } from './functions/withdrawLulo';

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
    ],
    tool_choice: 'auto',
  },
};
