import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-1';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-1';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-1';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-t-defi-hover';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-defi-hover';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-defi-hover';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-defi-hover';
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-t-defi-hover';
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 ${getPositionClasses()} pointer-events-none`}>
          <div className="relative">
            <div className="bg-defi-hover text-defi-light-text text-sm rounded-lg px-4 py-3 min-w-[280px] max-w-sm whitespace-pre-line border border-defi-border">
              {content}
            </div>
            <div 
              className={`absolute w-0 h-0 border-4 border-transparent ${getArrowClasses()}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface InfoTooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, position = 'top' }) => {
  return (
    <Tooltip content={content} position={position}>
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 text-[10px] text-defi-medium-text border border-defi-border rounded-full cursor-help hover:bg-defi-border hover:text-defi-light-text transition-all align-middle -translate-y-[1px]">
        ?
      </span>
    </Tooltip>
  );
};