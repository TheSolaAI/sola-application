import { FC } from 'react';
import { BaseChatContent, TokenDataChatContent } from './chatItem.ts';

export interface BaseTool {
  implementation: (
    args: any,
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: BaseChatContent;
  }>;
  abstraction: {
    type: `function`;
    name: string;
    description: string;
    parameters: any;
  };
}
export interface TokenDataTool extends BaseTool {
  implementation: (
    args: { token_address: string },
    response_id: string,
  ) => Promise<{
    status: 'success' | 'error';
    response: string;
    props?: TokenDataChatContent;
  }>;
  representation?: {
    props_type: 'token_data';
    component: FC<{ props: TokenDataChatContent }>;
  };
}

export type Tool = TokenDataTool;
