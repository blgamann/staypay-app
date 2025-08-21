import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-semibold transition-all duration-200 rounded-xl inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-defi-border disabled:text-defi-medium-text',
    secondary: 'bg-defi-border text-defi-light-text hover:bg-defi-hover active:bg-defi-hover disabled:bg-defi-darker disabled:text-defi-medium-text',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10 active:bg-primary-500/20 disabled:border-defi-border disabled:text-defi-medium-text',
    ghost: 'text-defi-light-text hover:bg-defi-border active:bg-defi-hover disabled:text-defi-medium-text',
    danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 disabled:bg-defi-border disabled:text-defi-medium-text',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const loadingClass = isLoading ? 'opacity-70 cursor-wait' : '';

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${loadingClass}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};