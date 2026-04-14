import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  footer?: ReactNode;
  variant?: 'left' | 'right';
}

export function PullQuote({
  text,
  onClick,
  disabled,
  selected,
  footer,
  variant = 'left',
}: Props) {
  const isButton = !!onClick;
  const Comp: any = isButton ? motion.button : motion.div;

  return (
    <Comp
      type={isButton ? 'button' : undefined}
      onClick={onClick}
      disabled={disabled}
      whileHover={isButton && !disabled ? { y: -2 } : undefined}
      whileTap={isButton && !disabled ? { scale: 0.99 } : undefined}
      layout
      className={[
        'card w-full text-left p-6 sm:p-10 flex flex-col justify-between gap-6 transition-colors',
        'min-h-[220px] sm:min-h-[320px]',
        isButton ? 'cursor-pointer' : '',
        selected
          ? 'ring-2 ring-accent border-accent/30 bg-gradient-to-br from-white to-accent/5'
          : 'hover:border-navy/20',
        disabled && !selected ? 'opacity-60 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-navy/40 mb-4">
          {variant === 'left' ? 'Option A' : 'Option B'}
        </p>
        <p className="pullquote text-navy">{text}</p>
      </div>
      {footer && <div className="text-xs text-navy/60">{footer}</div>}
    </Comp>
  );
}
