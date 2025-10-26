import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-3 text-left"
      >
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
        <ChevronDown
          size={18}
          className={clsx('transition-transform duration-200 text-slate-500 dark:text-slate-400', { 'rotate-180': isOpen })}
        />
      </button>
      {isOpen && (
        <div className="pb-4 pt-2 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default Accordion;
