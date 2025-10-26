import type { ReactElement } from 'react';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface ToggleButtonProps {
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export function ToggleButton({ label, Icon, isActive, onClick }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={clsx(
        "flex-1 p-2 rounded-md flex items-center justify-center transition-colors",
        isActive ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
      )}
    >
      <Icon size={18} />
    </button>
  );
}

interface ToggleButtonGroupProps {
  children: ReactElement<ToggleButtonProps> | ReactElement<ToggleButtonProps>[];
}

export function ToggleButtonGroup({ children }: ToggleButtonGroupProps) {
  return <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{children}</div>;
}
