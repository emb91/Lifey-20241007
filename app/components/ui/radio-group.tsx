// components/ui/radio-group.tsx

import React, { createContext, useContext, forwardRef } from 'react';

interface RadioGroupContextType {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({ name, value, onChange, children, className = '' }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ name, value, onChange }}>
      <div className={`space-y-2 ${className}`} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  value: string;
}

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, className = '', ...props }, ref) => {
    const group = useContext(RadioGroupContext);
    if (!group) {
      throw new Error('RadioGroupItem must be used within a RadioGroup');
    }

    return (
      <input
        type="radio"
        ref={ref}
        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${className}`}
        name={group.name}
        value={value}
        checked={group.value === value}
        onChange={() => group.onChange(value)}
        {...props}
      />
    );
  }
);

RadioGroupItem.displayName = 'RadioGroupItem';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  value: string;
  label: string;
  className?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ value, label, className = '', ...props }, ref) => {
    return (
      <label className={`flex items-center ${className}`}>
        <RadioGroupItem ref={ref} value={value} {...props} />
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      </label>
    );
  }
);

Radio.displayName = 'Radio';
