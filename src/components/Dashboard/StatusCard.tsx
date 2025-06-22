
import React from 'react';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const StatusCard = ({ title, count, icon, className, onClick }: StatusCardProps) => {
  return (
    <div 
      className={cn(
        "bg-white rounded-lg border border-gray-100 p-6 flex items-center space-x-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 p-3 bg-spazios-green/10 rounded-full group-hover:bg-spazios-green/20 transition-colors">
        <div className="text-spazios-green">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-spazios-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-spazios-gray-800">{count}</h3>
      </div>
    </div>
  );
};

export default StatusCard;
