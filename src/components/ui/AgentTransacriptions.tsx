import { MessageCard } from '../../types/messageCard';

interface AgentTranscriptionProps {
  item: MessageCard;
  index: number;
}

export default function AgentTranscription({
  item,
  index,
}: AgentTranscriptionProps) {
  return (
    <div
      key={index}
      className="mb-4 bg-sec_background p-3 rounded-lg text-secText leading-relaxed overflow-auto no-scrollbar transition-opacity duration-500"
    >
      {item.message}
    </div>
  );
}
