import React from 'react';

export interface Tool {
  implementation: (args: any) => Promise<string>; // takes in arguments returned form openAI and returns the response to send to it.
  abstraction: {
    type: `function`;
    name: string;
    description: string;
    parameters: any;
  };
  representation?: React.ReactElement;
}
