// app/components/ui/button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'link';
  size?: 'default' | 'sm';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'default', size = 'default', asChild, className, ...props }, ref) => {
    const baseStyles = 'px-6 py-2 font-medium border-none rounded-[60px]';
    const variantStyles = {
      default: 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-300',
      link: 'text-blue-600 hover:underline',
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