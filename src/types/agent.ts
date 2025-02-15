import React from 'react';
import { Tool } from './tool.ts';

export interface Agent {
  agentID: number;
  name: string;
  description: string;
  logo: React.ElementType;
  tools: Tool[];
}
