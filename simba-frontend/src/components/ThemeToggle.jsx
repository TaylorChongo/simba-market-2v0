import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      className="p-2 text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
      onClick={toggleTheme}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 transition-all duration-300" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400 transition-all duration-300" />
      )}
    </Button>
  );
};

export default ThemeToggle;
