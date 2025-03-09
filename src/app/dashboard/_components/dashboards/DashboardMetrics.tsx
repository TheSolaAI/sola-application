import { motion } from 'framer-motion';
import { FaEye } from 'react-icons/fa';
import { TbActivityHeartbeat } from 'react-icons/tb';

type BasicMetricCardProps = {
  label: string;
  value: string | number;
};

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

export const BasicMetricCard = ({ label, value }: BasicMetricCardProps) => (
  <motion.div
    variants={cardVariants}
    className="flex-auto basis-[calc(25%-0.75rem)] min-w-[180px] flex flex-col gap-2 bg-dashboardBackground text-textColorContrast rounded-lg p-3 shadow-md"
  >
    <h3 className="text-lg font-medium truncate">{label}</h3>
    <div className="flex justify-between items-center">
      <span className="truncate">{value}</span>
    </div>
  </motion.div>
);

export const MetricCard = ({ label, value, delta }: MetricCardProps) => (
  <motion.div
    variants={cardVariants}
    className="flex-auto basis-[calc(25%-0.75rem)] min-w-[180px] flex flex-col gap-2 bg-dashboardBackground text-textColorContrast rounded-lg p-3 shadow-md"
  >
    <h3 className="text-lg font-medium truncate">{label}</h3>
    <div className="flex justify-between items-center">
      <span className="truncate">{value}</span>
      <span
        className={`text-sm font-semibold p-1 rounded-lg text-subtext ml-2 whitespace-nowrap ${
          delta < 0 ? 'text-red-400 bg-red-200' : 'text-green-400 bg-green-200'
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
    className="flex-auto basis-[calc(25%-0.75rem)] min-w-[180px] flex flex-col gap-2 bg-dashboardBackground text-textColorContrast rounded-lg p-3 shadow-md"
  >
    <h3 className="text-lg font-medium truncate">{label}</h3>
    <span className="truncate">{value}</span>
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
    className="flex-auto basis-[calc(25%-0.8rem)] min-w-[100px] max-w-[25%] flex flex-col gap-2 bg-dashboardBackground text-textColorContrast shadow-md rounded-lg p-3 cursor-pointer hover:shadow-xl hover:bg-backgroundContrast"
  >
    <h3 className="text-base font-medium uppercase truncate">{label}</h3>
    <div className="flex justify-between items-center">
      <span className="truncate">
        <FaEye className="text-blue-400" /> {views}
      </span>
      <span className="truncate">
        <TbActivityHeartbeat className="text-rose-400" /> {impression}
      </span>
    </div>
  </motion.div>
);
