import { TbActivityHeartbeat } from 'react-icons/tb';
import { FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';

type MetricCardProps = {
  label: string;
  value: string | number;
  delta: number;
};

type LargeMetricCardProps = {
  label: string;
  value: string | number;
};

type TweetCardProps = {
  label: string;
  views: number;
  impression: number;
  url: string;
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const MetricCard = ({ label, value, delta }: MetricCardProps) => (
  <motion.div
    variants={cardVariants}
    className="flex-auto basis-[calc(25%-0.75rem)] min-w-[180px] flex flex-col gap-2 bg-baseBackground/75 rounded-lg p-3 shadow-sm"
  >
    <h3 className="text-lg text-secText truncate">{label}</h3>
    <div className="flex justify-between items-center text-textColor">
      <span className="truncate">{value}</span>
      <span
        className={`text-sm font-thin text-subtext ml-2 p-1 rounded-lg whitespace-nowrap ${
          delta < 0
            ? 'text-red-500 bg-red-200 '
            : 'text-green-500 bg-green-200 '
        }`}
      >
        {delta.toFixed(2)}%
      </span>
    </div>
  </motion.div>
);

export const LargeMetricCard = ({ label, value }: LargeMetricCardProps) => (
  <motion.div
    variants={cardVariants}
    className="flex-auto basis-[calc(25%-0.75rem)] min-w-[180px] flex flex-col gap-2 bg-baseBackground/75 rounded-lg p-3 shadow-sm"
  >
    <h3 className="text-lg text-secText truncate">{label}</h3>
    <span className="text-textColor truncate">{value}</span>
  </motion.div>
);

export const TweetCard = ({
  label,
  views,
  impression,
  url,
}: TweetCardProps) => (
  <motion.div
    variants={cardVariants}
    onClick={(e) => {
      e.preventDefault();
      window.open(url, '_blank');
    }}
    className="flex-auto basis-[calc(25%-0.8rem)] min-w-[100px] max-w-[25%] flex flex-col gap-2 bg-baseBackground/75 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md hover:bg-primary/20"
  >
    <h3 className="text-lg text-secText truncate">{label}</h3>
    <div className="flex justify-between items-center text-textColor">
      <span className="truncate">
        <FaEye className="text-blue-400" /> {views}
      </span>
      <span className="truncate">
        <TbActivityHeartbeat className="text-rose-400" /> {impression}
      </span>
    </div>
  </motion.div>
);
