import { cn } from '../lib/utils';

const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        'w-full px-4 py-2 rounded-full border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
};

export default Input;
