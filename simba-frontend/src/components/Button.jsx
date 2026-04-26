import { cn } from '../lib/utils';

const Button = ({ children, variant = 'primary', className, ...props }) => {
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container',
    secondary: 'bg-secondary text-on-secondary hover:bg-secondary-container',
    outline: 'border border-outline text-on-surface hover:bg-surface-container-high',
    ghost: 'hover:bg-surface-container-high text-on-surface',
  };

  return (
    <button
      className={cn(
        'px-4 py-2 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
