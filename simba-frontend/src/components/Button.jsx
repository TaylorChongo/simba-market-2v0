import { cn } from '../lib/utils';

const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container',
    secondary: 'bg-secondary text-on-secondary hover:bg-secondary-container',
    outline: 'border border-outline text-on-surface hover:bg-surface-container-high',
    ghost: 'hover:bg-surface-container-high text-on-surface',
  };

  const sizes = {
    sm: 'px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs',
    md: 'px-4 py-2.5 min-h-[44px] min-w-[44px] text-sm',
    lg: 'px-6 py-3.5 min-h-[48px] min-w-[48px] text-base',
  };

  return (
    <button
      className={cn(
        'rounded-full font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
