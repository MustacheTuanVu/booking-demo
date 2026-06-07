import React, { ReactNode } from 'react';

interface CustomerCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerRightContent?: ReactNode;
  noPadding?: boolean;
}

export function CustomerCard({ 
  children, 
  title, 
  subtitle, 
  className = '',
  headerRightContent,
  noPadding = false
}: CustomerCardProps) {
  return (
    <section className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 ${className}`}>
      {title && (
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {headerRightContent && (
            <div className="flex items-center">
              {headerRightContent}
            </div>
          )}
        </div>
      )}
      
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </section>
  );
}

interface CustomerCardGridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export function CustomerCardGrid({ 
  children, 
  columns = 1, 
  gap = 6,
  className = '' 
}: CustomerCardGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}

interface CustomerCardItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function CustomerCardItem({ 
  children, 
  className = '',
  onClick,
  isActive = false
}: CustomerCardItemProps) {
  const activeClass = isActive ? 'bg-gray-50 border-l-4 border-[var(--clr-bg-1)]' : '';
  const clickableClass = onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : '';

  return (
    <div 
      className={`p-4 border-b border-gray-100 last:border-b-0 ${clickableClass} ${activeClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CustomerCardButtonProps {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  isPrimary?: boolean;
  isFullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

export function CustomerCardButton({
  label,
  onClick,
  icon,
  isPrimary = true,
  isFullWidth = false,
  className = '',
  disabled = false
}: CustomerCardButtonProps) {
  const primaryClass = isPrimary 
    ? 'bg-[var(--clr-bg-1)] hover:bg-[var(--clr-bg-7)] text-white' 
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700';
  
  const widthClass = isFullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${primaryClass} ${widthClass} ${disabledClass} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
}

interface CustomerCardTabsProps {
  tabs: {label: string, content: ReactNode}[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export function CustomerCardTabs({
  tabs,
  activeIndex,
  onChange
}: CustomerCardTabsProps) {
  return (
    <div className="mb-6">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-2 px-4 border-b-2 transition-colors ${
              activeIndex === index 
                ? 'border-[var(--clr-bg-1)] text-[var(--clr-bg-1)] font-medium' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onChange(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {tabs[activeIndex].content}
      </div>
    </div>
  );
} 