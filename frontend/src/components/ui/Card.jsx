import { cn } from '../../lib/utils';

export function Card({ children, className, hover = true, ...props }) {
  return (
    <div
      className={cn(
        'glass-card p-6',
        hover && 'card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-6', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-2xl font-semibold text-gray-900 tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-gray-600 mt-2 leading-relaxed', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}
