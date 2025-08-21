import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  suffix,
  prefix,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {prefix}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 
            ${prefix ? 'pl-10' : ''}
            ${suffix ? 'pr-20' : ''}
            bg-white border rounded-xl
            ${error ? 'border-error-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
    </div>
  );
};

interface TokenInputProps {
  value: string;
  onChange: (value: string) => void;
  token?: {
    symbol: string;
    icon?: string;
  };
  balance?: string;
  onMaxClick?: () => void;
  label?: string;
  placeholder?: string;
}

export const TokenInput: React.FC<TokenInputProps> = ({
  value,
  onChange,
  token,
  balance,
  onMaxClick,
  label,
  placeholder = '0.0',
}) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {balance && (
            <span className="text-sm text-gray-500">
              Balance: {balance} {token?.symbol}
            </span>
          )}
        </div>
      )}
      <div className="relative bg-gray-50 rounded-xl p-4 border border-gray-200 focus-within:border-primary-500 transition-colors">
        <div className="flex items-center">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-2xl font-semibold outline-none placeholder-gray-400"
          />
          <div className="flex items-center gap-2">
            {onMaxClick && (
              <button
                onClick={onMaxClick}
                className="px-2 py-1 text-xs font-semibold text-primary-500 hover:bg-primary-50 rounded-md transition-colors"
              >
                MAX
              </button>
            )}
            {token && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                {token.icon && (
                  <img src={token.icon} alt={token.symbol} className="w-5 h-5" />
                )}
                <span className="font-semibold">{token.symbol}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface PercentageInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export const PercentageInput: React.FC<PercentageInputProps> = ({
  value,
  onChange,
  label,
}) => {
  const percentages = [25, 50, 75, 100];

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        {percentages.map((percent) => (
          <button
            key={percent}
            onClick={() => onChange(percent)}
            className={`
              flex-1 py-2 px-3 rounded-lg font-medium transition-all
              ${value === percent 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {percent}%
          </button>
        ))}
      </div>
      <div className="mt-3">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>{value}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};