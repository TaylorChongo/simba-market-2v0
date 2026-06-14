import { cn } from '../lib/utils';

const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        'w-full px-5 py-3 min-h-[44px] rounded-2xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 font-medium',
        className
      )}
      {...props}
    />
  );
};

export default Input;
