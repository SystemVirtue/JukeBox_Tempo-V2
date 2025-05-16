import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TabProps {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
}

interface TabListProps {
  children: ReactNode;
  className?: string;
}

interface TabContentProps {
  children: ReactNode;
  className?: string;
}

export const Tab: React.FC<TabProps> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'skeuo-button flex items-center gap-2 mx-2 px-4 py-2 rounded-md transition-all duration-200',
        active ? 'skeuo-button-primary' : ''
      )}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

export const TabList: React.FC<TabListProps> = ({ children, className }) => {
  return (
    <div className={cn('flex items-center', className)}>
      {children}
    </div>
  );
};

export const TabContent: React.FC<TabContentProps> = ({ children, className }) => {
  return (
    <div className={cn('w-full h-full', className)}>
      {children}
    </div>
  );
};
