import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick 
}) => {
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm border border-slate-200 
        hover:shadow-lg transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};