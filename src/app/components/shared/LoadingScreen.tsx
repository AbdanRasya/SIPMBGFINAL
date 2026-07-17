import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FoodPatternBackground } from "./FoodPatternBackground";

interface LoadingScreenProps {
  onComplete: () => void;
  theme: any;
  duration?: number;
}

export function LoadingScreen({ onComplete, theme, duration = 3000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ color: theme?.textMain || '#000000' }}
    >
      <FoodPatternBackground theme={theme} />

      {/* Main Content Box */}
      <div className="relative w-full max-w-3xl flex flex-col items-center z-10 mt-[-50px]">
        
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold mb-2">Memuat SIPMBG</h2>
          <p className="text-sm opacity-70">Menyiapkan dashboard untuk Anda...</p>
        </motion.div>

        {/* Animation Container */}
        <div className="relative w-full h-32 mb-6 flex flex-col justify-end">

          {/* Road Surface */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-slate-200 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-center z-10">
            {/* Animated Dashed Line to simulate fast movement */}
            <motion.div 
              animate={{ x: ["0%", "-50%"] }} 
              transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
              className="w-[200%] h-1.5 opacity-60"
              style={{
                backgroundImage: 'linear-gradient(to right, currentColor 50%, transparent 50%)',
                backgroundSize: '40px 100%'
              }}
            />
          </div>

          {/* Progress fill line at the very bottom edge of the road */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 z-20 bg-gray-300 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-blue-600 transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Moving Van */}
          <div
            className="absolute bottom-3 w-32 sm:w-40 transition-all duration-75 ease-linear z-30"
            style={{ 
              left: `${progress}%`,
              transform: `translateX(-${progress}%)` // Prevents overflowing outside the container at 100%
            }} 
          >
            {/* Bouncing effect for the van to make it look like it's driving */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 0.25, ease: "easeInOut" }}
            >
              <img 
                src="/mbg-van.png" 
                alt="MBG Van" 
                className="w-full h-auto drop-shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>';
                  (e.target as HTMLImageElement).classList.add('opacity-50');
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Percentage Text */}
        <div className="flex justify-between w-full text-sm font-medium px-2 mt-4">
          <span className="opacity-70 font-semibold tracking-wider uppercase text-xs">Progress</span>
          <span className="text-blue-600 font-bold text-lg">{Math.round(progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
}
