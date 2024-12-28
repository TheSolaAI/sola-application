import { toggleWallet } from "./functions/toggleWallet";

export const tools = {
  type: 'session.update',
  session: {
    tools: [toggleWallet,],
    tool_choice: 'auto',
  },
};
