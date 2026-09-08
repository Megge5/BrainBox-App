import React, { useEffect, useState } from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';

interface AndroidStatusBarProps {
  darkMode?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ darkMode = true }) => {
  const [time, setTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`w-full px-5 pt-2 pb-1.5 flex items-center justify-between text-xs font-semibold select-none z-30 transition-colors ${
        darkMode ? 'text-slate-300' : 'text-slate-700'
      }`}
    >
      <span className="tracking-tight font-medium font-mono text-[13px]">{time}</span>
      <div className="flex items-center space-x-2">
        <Wifi className="w-3.5 h-3.5" />
        <Signal className="w-3.5 h-3.5" />
        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-mono">98%</span>
          <Battery className="w-4 h-4 fill-current" />
        </div>
      </div>
    </div>
  );
};
