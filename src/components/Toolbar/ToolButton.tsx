import { clsx } from 'clsx';
import type { Tool } from '../../config/tools.config';

interface ToolButtonProps {
  tool: Tool;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ToolButton({ tool, isActive, onClick, disabled = false }: ToolButtonProps) {
  const { Icon, name, shortcut } = tool;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group relative',
        { 'bg-blue-500 text-white hover:bg-blue-600': isActive && !disabled },
        { 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300': !isActive && !disabled },
        { 'opacity-50 cursor-not-allowed': disabled }
      )}
      title={`${name} (${shortcut})`}
    >
      <Icon size={20} />
      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-200 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-600 dark:border-slate-600">
        {name} <span className="text-slate-400 dark:text-slate-500">({shortcut})</span>
      </span>
    </button>
  );
}

export default ToolButton;
