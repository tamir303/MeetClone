import React from 'react';
import { clsx } from 'clsx';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      switch: 'h-5 w-9',
      thumb: 'h-4 w-4',
      translate: 'translate-x-4'
    },
    md: {
      switch: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: 'translate-x-5'
    }
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        className={clsx(
          'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          sizeClasses[size].switch,
          checked ? 'bg-blue-600' : 'bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span className="sr-only">{label}</span>
        <span
          className={clsx(
            'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out',
            sizeClasses[size].thumb,
            checked ? sizeClasses[size].translate : 'translate-x-0'
          )}
        />
      </button>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-700">
          {label}
        </span>
      )}
    </div>
  );
};