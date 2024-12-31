import { addCalenderEvent } from "./functions/addCalenderEvent";
import { getNFTLaunchpad } from "./functions/getLaunchpadCollections";
import { swapTokens } from "./functions/swapTokens";
import { toggleWallet } from "./functions/toggleWallet";

export const tools = {
  type: 'session.update',
  session: {
    tools: [toggleWallet, swapTokens, addCalenderEvent, getNFTLaunchpad],
    tool_choice: 'auto',
  },
};
