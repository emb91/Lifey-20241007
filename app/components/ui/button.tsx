// app/components/ui/button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'link';
  size?: 'default' | 'sm';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'default', size = 'default', asChild, className, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantStyles = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      link: 'text-blue-600 hover:underline focus:ring-blue-500',
    };
    const sizeStyles = {
      default: 'text-base',
      sm: 'text-sm px-3 py-1',
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`;

    if (asChild) {
      return React.Children.map(children, child => 
        React.isValidElement(child)
          ? React.cloneElement(child, {
              ...props,
              className: `${combinedClassName} ${child.props.className || ''}`,
              ref,
            })
          : child
      );
    }

    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';