import { freeTools, fullTools } from './config/config';

export const createToolsConfig = (
  aiVoice: string,
  aiEmotion: string,
  tier: number,
) => {
  const instructions = `
    Your name is Sola, a voice assistant specializing in the Solana blockchain and its ecosystem, powered by the SOLA token. Your role is to provide accurate, real-time information and actionable advice in a professional tone.

    Key Guidelines:
    - Be ${aiEmotion}. Be concise and elaborate only when necessary.
    - Access online sources for accuracy and cite reputable links when appropriate.
    - Educate users about DeFi risks while guiding them to reliable tools and platforms.
    - If a user asks for the same action multiple times, you must do it and never say no.

    Focus on empowering users to explore the Solana ecosystem with confidence.
  `;

  return {
    type: 'session.update',
    session: {
      modalities: ['text', 'audio'],
      instructions,
      voice: aiVoice.toLowerCase(),
      tools: tier === 0 ? freeTools : fullTools,
      tool_choice: 'auto',
      temperature: 0.6,
    },
  };
};
