'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  targetDate: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [localLaunchTime, setLocalLaunchTime] = useState('');
  const [isLaunched, setIsLaunched] = useState(false);

  useEffect(() => {
    // Format the date according to user's locale
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    };

    setLocalLaunchTime(targetDate.toLocaleString(undefined, options));

    // Set up the countdown timer
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsLaunched(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  const digitVariants = {
    initial: { opacity: 0, rotateX: -90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 },
  };

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  return (
    <div className="flex flex-col items-center justify-center mt-25 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          {isLaunched ? "We've Launched! 🚀" : 'Launching Soon'}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl md:text-2xl text-blue-200"
        >
          {isLaunched ? 'Now available!' : `Launching at ${localLaunchTime}`}
        </motion.p>
      </motion.div>

      {!isLaunched && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
        >
          {timeUnits.map((item, index) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate="pulse"
                className="rounded-2xl p-4 md:p-8 backdrop-blur-sm bg-opacity-30 border border-blue-400/30 w-full"
              >
                <motion.span
                  key={`${item.value}-${item.label}`}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={digitVariants}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="block text-3xl md:text-6xl font-bold text-center"
                >
                  {item.value.toString().padStart(2, '0')}
                </motion.span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="mt-2 text-sm md:text-xl text-blue-200 font-medium"
              >
                {item.label}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {isLaunched && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            duration: 1,
          }}
          className="mt-8 bg-gradient-to-r from-green-500 to-teal-500 px-8 py-4 rounded-xl shadow-lg"
        >
          <span className="text-2xl font-bold">Explore Now!</span>
        </motion.div>
      )}
    </div>
  );
};

export default CountdownTimer;
