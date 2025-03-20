import React from 'react';
import { Tool } from './tool.ts';

export interface Agent {
  slug: string;
  name: string;
  description: string;
  logo: React.ElementType;
  tools: Tool[];
}
