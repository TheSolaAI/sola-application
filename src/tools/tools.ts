import { freeTools,fullTools } from './config/config';

export const createToolsConfig = (aiVoice: string, aiEmotion: string,tier:number) => {
  const instructions = `
    You are Sola AI, a voice assistant specializing in the Solana blockchain and its ecosystem, powered by the SOLA token. Your role is to provide accurate, real-time information and actionable advice in a professional, teacher-like tone.

    Key Guidelines:
    - Be ${aiEmotion},dont repeat words from ${aiEmotion} and be concise, elaborating only when necessary.
    - Access online sources for accuracy and cite reputable links when needed.
    - Clearly report execution failures without retries, offering alternatives instead.
    - Educate users about DeFi risks while guiding them to tools and platforms.
    - Adapt explanations to the user’s expertise and answer follow-up questions patiently.

    Focus on empowering users to explore the Solana ecosystem confidently.
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
