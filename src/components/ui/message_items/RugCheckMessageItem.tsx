import { FC } from 'react';
import { RugCheckChatContent } from '../../../types/chatItem.ts';
import BaseGridChatItem from './general/BaseGridChatItem.tsx';

interface RugCheckChatItemProps {
  props: RugCheckChatContent;
}

export const RugCheckChatItem: FC<RugCheckChatItemProps> = ({ props }) => {
  const issues = props.data?.issues || [];
  const scoreColor =
    issues.length === 0
      ? 'text-green-500'
      : issues.length === 1
        ? 'text-yellow-500'
        : issues.length === 2
          ? 'text-orange-500'
          : 'text-red-500';

  const getRiskColor = (level: 'warn' | 'danger' | 'none') => {
    switch (level) {
      case 'warn':
        return 'text-orange-500';
      case 'danger':
        return 'text-red-500';
      default:
        return 'text-green-500';
    }
  };
  return (
    <BaseGridChatItem col={1}>
      <span className={`${scoreColor} font-semibold p-2`}>
        Risk Level: {props.data.score}
      </span>

      <div className="flex flex-col gap-4 p-2">
        {props.data.issues.length === 0 ? (
          <p className="text-green-500 font-thin">No Risks Found</p>
        ) : (
          props.data.issues.map((risk, index) => (
            <div
              key={index}
              className="bg-surface p-4 rounded-lg shadow dark:bg-darkalign2"
            >
              <h4 className={`font-medium ${getRiskColor(risk.level)}`}>
                {risk.name} ({risk.level})
              </h4>
              <p className="text-base">{risk.description}</p>
              {risk.value && <p className="font-thin">Value: {risk.value}</p>}
              <p className="font-thin">Score: {risk.score}</p>
            </div>
          ))
        )}
      </div>
    </BaseGridChatItem>
  );
};
