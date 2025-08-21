import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-defi-border text-defi-light-text',
    success: 'bg-success-500/20 text-success-500',
    warning: 'bg-warning-500/20 text-warning-500',
    error: 'bg-error-500/20 text-error-500',
    info: 'bg-primary-500/20 text-primary-400',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

interface APYBadgeProps {
  value: number;
  className?: string;
}

export const APYBadge: React.FC<APYBadgeProps> = ({ value, className = '' }) => {
  const variant = value > 20 ? 'success' : value > 10 ? 'info' : 'default';
  
  return (
    <Badge variant={variant} className={className}>
      <span className="mr-1">APY</span>
      <span className="font-bold">{value.toFixed(2)}%</span>
    </Badge>
  );
};

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high';
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = '' }) => {
  const variants = {
    low: 'success',
    medium: 'warning',
    high: 'error',
  } as const;
  
  const labels = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  };

  return (
    <Badge variant={variants[level]} className={className}>
      {labels[level]}
    </Badge>
  );
};