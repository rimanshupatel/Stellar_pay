import { cn } from '../../lib/utils';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  disabled,
  onClick,
  ...props 
}) {
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200',
    outline: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 shadow-sm',
    ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  return (
    <button
      className={cn(
        'font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-lift',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
