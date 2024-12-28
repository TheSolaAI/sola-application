import { swapTokens } from "./functions/swapTokens";
import { toggleWallet } from "./functions/toggleWallet";

export const tools = {
  type: 'session.update',
  session: {
    tools: [toggleWallet, swapTokens],
    tool_choice: 'auto',
  },
};
