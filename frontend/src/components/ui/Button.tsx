import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-colors inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-[#28C88C] hover:bg-[#24B37D] text-white shadow-lg disabled:bg-[#8E9CB1]',
    secondary: 'bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155]',
    outline: 'border-2 border-[#334155] hover:border-[#28C88C] text-white hover:text-[#28C88C]',
    ghost: 'text-[#8E9CB1] hover:text-white hover:bg-[#1E293B]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
