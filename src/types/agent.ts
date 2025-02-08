import React from 'react';

export interface Agent {
  agentID: number;
  name: string;
  description: string;
  logo: React.ElementType;
  tools: {
    type: string;
    name: string;
    description: string;
    strict: boolean;
    parameters: { type: string; properties: {} };
  }[];
}
